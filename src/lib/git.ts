import Git, { Errors, type FsClient } from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";

export type Tone = "dim" | "accent" | "ok" | "danger" | "warn" | "plain";
export type Seed = "empty" | "starter";

export interface Line {
  s: string;
  c?: Tone;
}

export type FileState = "conflict" | "staged" | "new" | "modified" | "deleted" | "unchanged";

export interface DiffLine {
  t: "add" | "del";
  s: string;
}

export interface DiffResult {
  added: number;
  removed: number;
  same: boolean;
  lines: DiffLine[];
}

function diffText(base: string, cur: string): DiffResult {
  const a = base === "" ? [] : base.split("\n");
  const b = cur === "" ? [] : cur.split("\n");
  if (base === cur) return { added: 0, removed: 0, same: true, lines: [] };
  let pre = 0;
  const min = Math.min(a.length, b.length);
  while (pre < min && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < min - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
  const aMid = a.slice(pre, a.length - suf);
  const bMid = b.slice(pre, b.length - suf);
  const lines: DiffLine[] = [
    ...aMid.map((l) => ({ t: "del" as const, s: l })),
    ...bMid.map((l) => ({ t: "add" as const, s: l })),
  ];
  return { added: bMid.length, removed: aMid.length, same: false, lines };
}

const MARKED = /<<<<<<<|=======|>>>>>>>/;

const AUTHOR = { name: "You", email: "you@example.com" };

type StatusRow = [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3];

interface LfsPromises {
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: string | Uint8Array): Promise<void>;
  mkdir(path: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<{ isDirectory(): boolean }>;
  unlink(path: string): Promise<void>;
  rmdir(path: string): Promise<void>;
}

type LfsClient = FsClient & { promises: LfsPromises };

export type StashOp = "push" | "list" | "pop" | "apply" | "drop" | "clear";

export interface RebaseStep {
  oid: string;
  msg: string;
  author: { name: string; email: string; timestamp: number; timezoneOffset?: number };
}

export class GitEngine {
  private seed: Seed;
  private dbName: string;
  private dir = "/practice";
  private fs: LfsClient | null = null;
  private cache: object = {};
  private terminal: Line[] = [];
  private conflicts = new Set<string>();
  private mergeState: { oursId: string; theirsId: string; branch: string } | null = null;
  private rebaseState: {
    branch: string;
    prevOid: string;
    total: number;
    done: number;
    onLabel: string;
    plan: RebaseStep[];
    paused: RebaseStep | null;
  } | null = null;
  private cherryState: { oid: string; msg: string; author: RebaseStep["author"] } | null = null;
  private revertState: { oid: string; msg: string; author: RebaseStep["author"] } | null = null;
  private reflog: { oid: string; action: string; when: number }[] = [];
  private originDir = "/origin";
  private ready = false;

  constructor(seed: Seed = "starter") {
    this.seed = seed;
    this.dbName = `git-indepth-${seed}-v1`;
  }

  get booted(): boolean {
    return this.ready;
  }

  get conflictPaths(): ReadonlySet<string> {
    return this.conflicts;
  }

  async boot(): Promise<void> {
    const lfs = new LightningFS(this.dbName);
    await lfs.init(this.dbName, { wipe: true });
    const fs = (lfs as unknown) as LfsClient;
    this.fs = fs;
    await Git.init({ fs, dir: this.dir, defaultBranch: "main" });
    if (this.seed === "starter") await this.seedStarter();
    this.ready = true;
  }

  private async fsWrite(path: string, content: string): Promise<void> {
    if (!this.fs) throw new Error("engine not booted");
    const dirPath = path.split("/");
    const file = dirPath.pop()!;
    let cur = this.dir;
    for (const part of dirPath) {
      cur += "/" + part;
      try {
        await this.fs.promises.mkdir(cur);
      } catch {}
    }
    await this.fs.promises.writeFile(cur + "/" + file, content);
  }

  private async seedStarter(): Promise<void> {
    const c1 = { msg: "init scaffold", files: [
      ["README.md", "# My app\n\nA tiny project you can practice git on.\n"],
      ["src/app.js", "const app = () => hello;\n\nmodule.exports = app;\n"],
    ] as [string, string][] };
    const c2 = { msg: "feat: add top nav", files: [
      ["README.md", "# My app\n\nA tiny project you can practice git on.\n"],
      ["src/app.js", "const app = () => hello;\n\nconst nav = ['home', 'about'];\n\nmodule.exports = { app, nav };\n"],
      ["src/header.js", "export function Header() {\n  return <div className=\"nav\">top</div>;\n}\n"],
    ] as [string, string][] };
    for (const c of [c1, c2]) {
      for (const [path, content] of c.files) await this.fsWrite(path, content);
      await Git.add({ fs: this.fs!, cache: this.cache, dir: this.dir, filepath: "." });
      await Git.commit({ fs: this.fs!, cache: this.cache, dir: this.dir, message: c.msg, author: AUTHOR, committer: AUTHOR });
    }
  }

  // ---- public API (terminal + introspection) ----

  clearTerminal() {
    this.terminal = [];
  }

  snapshotLines(): Line[] {
    return [...this.terminal];
  }

  pushLine(line: Line) {
    this.terminal.push(line);
  }

  async run(cmd: string): Promise<Line[]> {
    const input = typeof cmd === "string" ? cmd.trim().slice(0, 2000) : "";
    if (!input) return [];
    const out: Line[] = [];
    for (const part of input.split(/\s*&&\s*/)) {
      if (!part.trim()) {
        const err = { s: "sh: parse error: empty command in && list", c: "danger" as Tone };
        this.terminal.push(err);
        out.push(err);
        continue;
      }
      const stage = await this.dispatch(part.trim());
      this.terminal.push(...stage);
      out.push(...stage);
      if (stage.some((l) => l.c === "danger")) break;
    }
    return out;
  }

  private dispatch(cmd: string): Promise<Line[]> {
    this.terminal.push({ s: `$ ${cmd}`, c: "plain" });
    try {
      const parts = this.splitArgs(cmd);
      if (parts[0] === "git") return this.runGit(parts.slice(1));
      if (parts[0] === "clear") {
        this.terminal = [];
        return Promise.resolve([]);
      }
      if (parts[0] === "help") return Promise.resolve(this.help());
      if (parts[0] === "cat") return this.cat(parts.slice(1));
      if (parts[0] === "ls") return this.ls();
      this.terminal.pop();
      return Promise.resolve([{ s: `bash: ${parts[0]}: command not found`, c: "danger" }]);
    } catch (err) {
      this.terminal.pop();
      const msg = err instanceof Error ? err.message : String(err);
      return Promise.resolve([{ s: `internal: unexpected error — ${msg}`, c: "danger" }]);
    }
  }

  async listWorkFiles(): Promise<{ path: string; conflict: boolean }[]> {
    if (!this.fs) return [];
    const out: { path: string; conflict: boolean }[] = [];
    const walk = async (rel: string): Promise<void> => {
      const dirPath = rel === "" ? this.dir : `${this.dir}/${rel}`;
      let entries: string[];
      try {
        entries = await this.fs!.promises.readdir(dirPath);
      } catch {
        return;
      }
      for (const e of entries.sort()) {
        const relPath = rel === "" ? e : `${rel}/${e}`;
        const absPath = `${this.dir}/${relPath}`;
        let st;
        try {
          st = await this.fs!.promises.stat(absPath);
        } catch {
          continue;
        }
        if (st.isDirectory()) await walk(relPath);
        else {
          out.push({ path: relPath, conflict: this.conflicts.has(relPath) });
        }
      }
    };
    await walk("");
    return out;
  }

  async setWorkFile(path: string, content: string): Promise<void> {
    await this.fsWrite(path, content);
  }

  async readWorkFile(path: string): Promise<string> {
    if (!this.fs) return "";
    try {
      const buf = await this.fs.promises.readFile(`${this.dir}/${path}`);
      return Buffer.from(buf).toString("utf8");
    } catch {
      return "";
    }
  }

  async fileStates(): Promise<{ path: string; state: FileState }[]> {
    const matrix = await this.statusMatrix();
    const out: { path: string; state: FileState }[] = [];
    for (const [path, h, w, s] of matrix) out.push({ path, state: this.classify(h, w, s, path) });
    return out;
  }

  async diffDraft(path: string, draft: string): Promise<DiffResult> {
    const base = await this.headBlob(path);
    return diffText(base, draft);
  }

  async refreshConflicts(): Promise<Set<string>> {
    const found = new Set<string>();
    for (const f of await this.listWorkFiles()) {
      const content = await this.readWorkFile(f.path);
      if (MARKED.test(content)) found.add(f.path);
    }
    this.conflicts = found;
    return found;
  }

  catchConflictError(err: unknown): boolean {
    return err instanceof Errors.MergeConflictError || err instanceof Errors.MergeNotSupportedError;
  }

  // ---- helpers ----

  private splitArgs(cmd: string): string[] {
    const out: string[] = [];
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(cmd))) out.push(m[1] ?? m[2] ?? m[3]);
    return out;
  }

  private splitPaths(s: string): string[] {
    return s
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  private async statusMatrix(): Promise<StatusRow[]> {
    if (!this.fs) return [];
    try {
      const rows = (await Git.statusMatrix({
        fs: this.fs, cache: this.cache,
        dir: this.dir,
        filepaths: ["."],
      })) as StatusRow[];
      rows.sort((a, b) => (a[0] < b[0] ? -1 : 1));
      return rows;
    } catch {
      return [];
    }
  }

  private classify(h: 0 | 1, w: 0 | 1 | 2, s: 0 | 1 | 2 | 3, path: string): FileState {
    if (this.conflicts.has(path)) return "conflict";
    if (h === 1 && w === 1 && s === 1) return "unchanged";
    if (s === 2 || s === 3) return "staged";
    if (h === 1 && w === 0 && s === 0) return "deleted";
    if (h === 0 && w === 2 && s === 0) return "new";
    if (h === 1 && w === 0) return "deleted";
    if (h === 1 && w === 2) return "modified";
    if (h === 0 && w === 2) return "new";
    return "unchanged";
  }

  private async headOid(): Promise<string> {
    if (!this.fs) throw new Error("engine not booted");
    return Git.resolveRef({ fs: this.fs, dir: this.dir, ref: "HEAD" });
  }

  private async headBlob(path: string): Promise<string> {
    if (!this.fs) return "";
    try {
      const oid = await this.headOid();
      const { blob } = await Git.readBlob({ fs: this.fs, cache: this.cache, dir: this.dir, oid, filepath: path });
      return Buffer.from(blob).toString("utf8");
    } catch {
      return "";
    }
  }

  private async refId(ref: string): Promise<string> {
    if (!this.fs) return "";
    const tries = [ref];
    if (ref === "HEAD") tries.push("HEAD");
    for (const r of tries) {
      try {
        return await Git.resolveRef({ fs: this.fs, dir: this.dir, ref: r });
      } catch {}
    }
    try {
      const expanded = await Git.expandOid({ fs: this.fs, cache: this.cache, dir: this.dir, oid: ref });
      if (expanded) return expanded;
    } catch {}
    if (ref.startsWith("HEAD~")) {
      const n = parseInt(ref.slice(5) || "1", 10) || 1;
      let cur = await this.headOid();
      for (let i = 0; i < n; i++) {
        try {
          const c = await Git.readCommit({ fs: this.fs, cache: this.cache, dir: this.dir, oid: cur });
          cur = c.commit.parent[0];
          if (!cur) return "";
        } catch {
          return "";
        }
      }
      return cur;
    }
    return "";
  }

  private async currentBranchName(): Promise<string> {
    if (!this.fs) return "main";
    const name = await Git.currentBranch({ fs: this.fs, dir: this.dir });
    return name ?? "main";
  }

  private async configuredAuthor(): Promise<{ name: string; email: string }> {
    if (!this.fs) return AUTHOR;
    try {
      const name = await Git.getConfig({ fs: this.fs, dir: this.dir, path: "user.name" });
      const email = await Git.getConfig({ fs: this.fs, dir: this.dir, path: "user.email" });
      if (name && email) return { name: String(name), email: String(email) };
    } catch {}
    return AUTHOR;
  }

  private refentry(action: string): void {
    if (!this.fs) return;
    void Git.resolveRef({ fs: this.fs, dir: this.dir, ref: "HEAD" }).then((oid) => {
      this.reflog.unshift({ oid, action, when: Date.now() });
    });
  }

  private async chips(oid: string): Promise<string> {
    if (!this.fs) return "";
    const heads: string[] = [];
    for (const name of await Git.listBranches({ fs: this.fs, dir: this.dir })) {
      try {
        if ((await Git.resolveRef({ fs: this.fs, dir: this.dir, ref: name })) === oid) heads.push(name);
      } catch {}
    }
    return heads.length ? ` (${heads.join(", ")})` : "";
  }

  private help(): Line[] {
    return [
      { s: "Available commands:", c: "accent" },
      { s: "  git status | git status --short   file states", c: "plain" },
      { s: "  git add <file> | .      stage a file (or everything)", c: "plain" },
      { s: "  git commit -m \"msg\"     snapshot the index into history", c: "plain" },
      { s: "  git log [--oneline]     read history (full or compact)", c: "plain" },
      { s: "  git diff [--cached]     show unstaged (or staged) changes", c: "plain" },
      { s: "  git show <rev>          a commit + the files it changed", c: "plain" },
      { s: "  git cat-file -t|-p <rev>  inspect objects (HEAD:path works)", c: "plain" },
      { s: "  git branch <name>       create a branch from HEAD", c: "plain" },
      { s: "  git switch <b> | -c <n>  move between branches", c: "plain" },
      { s: "  git merge <branch>      real three-way merge — conflicts leave markers", c: "plain" },
      { s: "  git merge --abort | --continue", c: "plain" },
      { s: "  git rebase <branch>     replay your commits on top of that branch (conflicts stop it)", c: "plain" },
      { s: "  git rebase --abort | --continue", c: "plain" },
      { s: "  git reset --hard <ref>  move HEAD (ref = HEAD~n, branch, or hash)", c: "plain" },
      { s: "  git stash push | list | pop | apply | drop | clear", c: "plain" },
      { s: "  git rm <file>           remove a file from work + index", c: "plain" },
      { s: "  git config <k> <v>      user.name / user.email — read: git config <k>, list: --list", c: "plain" },
      { s: "  git tag [name] [commit] lightweight tags; -d to delete", c: "plain" },
      { s: "  git restore [--staged] <file>   undo unstaged edits / unstage", c: "plain" },
      { s: "  git clean -fd           remove untracked files (-n previews)", c: "plain" },
      { s: "  git cherry-pick <commit>  replay one commit onto HEAD (--continue/--abort)", c: "plain" },
      { s: "  git revert <commit>     safely undo a commit backwards (--continue/--abort)", c: "plain" },
      { s: "  git reflog              every HEAD move, recoverable with git reset", c: "plain" },
      { s: "  git blame <file>        who changed each line", c: "plain" },
      { s: "  git gc                  tidy the object store (mostly cosmetic here)", c: "plain" },
      { s: "  git remote add origin /origin   the in-sandbox remote", c: "plain" },
      { s: "  git push / pull / fetch origin [branch]   ship & take commits", c: "plain" },
      { s: "  git clone /origin <name>  copy the remote into /clones/<name>", c: "plain" },
      { s: "  cat <file> | ls | clear | git --version", c: "plain" },
      { s: "  chain commands with &&   e.g. git add . && git commit -m \"x\"", c: "plain" },
    ];
  }

  // ---- commands ----

  private async runGit(args: string[]): Promise<Line[]> {
    if (!this.fs || !this.ready) return [{ s: "engine is still booting…", c: "warn" }];
    const sub = args[0] ?? "";
    switch (sub) {
      case "":
        return [{ s: "usage: git [-v | --version] [--help] <command> [<args>]", c: "warn" }];
      case "-v":
      case "--version":
        return [{ s: "git version 2.47.0", c: "dim" }];
      case "-h":
      case "--help":
      case "help":
        return this.help();
      case "init":
        return [{ s: "Initialized empty Git repository in /practice/.git/", c: "dim" }];
      case "status":
      case "st":
        return this.status(args.slice(1));
      case "add":
        return this.add(args.slice(1));
      case "commit":
        return this.commit(args.slice(1));
      case "log":
        return this.logCmd(args.slice(1));
      case "branch":
        return this.branch(args.slice(1));
      case "switch":
      case "checkout":
        return this.switchTo(args.slice(1));
      case "merge":
        return this.merge(args.slice(1));
      case "rebase":
        return this.rebaseCmd(args.slice(1));
      case "reset":
        return this.reset(args.slice(1));
      case "stash":
        return this.stashCmd(args.slice(1));
      case "diff":
        return this.diffCmd(args.slice(1));
      case "show":
        return this.showCmd(args.slice(1));
      case "cat-file":
        return this.catFile(args.slice(1));
      case "rm":
        return this.rm(args.slice(1));
      case "config":
        return this.configCmd(args.slice(1));
      case "tag":
        return this.tagCmd(args.slice(1));
      case "clean":
        return this.cleanCmd(args.slice(1));
      case "restore":
        return this.restoreCmd(args.slice(1));
      case "cherry-pick":
        return this.cherryCmd(args.slice(1));
      case "revert":
        return this.revertCmd(args.slice(1));
      case "reflog":
        return this.reflogCmd();
      case "gc":
        return this.gcCmd(args.slice(1));
      case "blame":
        return this.blameCmd(args.slice(1));
      case "remote":
        return this.remoteCmd(args.slice(1));
      case "fetch":
        return this.fetchCmd(args.slice(1));
      case "pull":
        return this.pullCmd(args.slice(1));
      case "push":
        return this.pushCmd(args.slice(1));
      case "clone":
        return this.cloneCmd(args.slice(1));
      default:
        return [{ s: `git: '${sub}' is not a git command. See 'git --help'.`, c: "danger" }];
    }
  }

  private async status(args: string[]): Promise<Line[]> {
    if (args[0] === "--short" || args[0] === "-s" || args[0] === "--porcelain") return this.shortStatus();
    const matrix = await this.statusMatrix();
    const stagedAdd: string[] = [];
    const stagedMod: string[] = [];
    const stagedDel: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];
    for (const [path, h, w, s] of matrix) {
      if (this.conflicts.has(path)) continue;
      const state = this.classify(h, w, s, path);
      if (state === "staged") {
        if (h === 0) stagedAdd.push(path);
        else if (w === 0) stagedDel.push(path);
        else stagedMod.push(path);
      } else if (state === "new") untracked.push(path);
      else if (state === "deleted") unstaged.push(path);
      else if (state === "modified") unstaged.push(path);
    }
    const branchLabel = this.rebaseState
      ? `${this.rebaseState.branch} (rebasing onto ${this.rebaseState.onLabel})`
      : await this.currentBranchName();
    const out: Line[] = [{ s: `On branch ${branchLabel}`, c: "plain" }];
    if (this.conflicts.size) {
      const cont = this.rebaseState
        ? "git rebase --continue"
        : this.cherryState
          ? "git cherry-pick --continue"
          : this.revertState
            ? "git revert --continue"
            : "git merge --continue";
      out.push({ s: "You have unmerged paths.", c: "danger" });
      out.push({ s: '  (use "git add <file>..." to mark resolution)', c: "dim" });
      out.push({ s: "Unmerged paths:", c: "warn" });
      for (const p of [...this.conflicts].sort()) out.push({ s: `    both modified:   ${p}`, c: "danger" });
      out.push({ s: `  (fix conflicts and then run "${cont}")`, c: "dim" });
    } else if (this.rebaseState) {
      out.push({ s: `You are currently rebasing branch '${this.rebaseState.branch}' on '${this.rebaseState.onLabel}'.`, c: "accent" });
      out.push({ s: "All conflicts fixed but you are still rebasing.", c: "accent" });
      out.push({ s: '  (use "git rebase --continue" to conclude)', c: "dim" });
    } else if (this.mergeState) {
      out.push({ s: "All conflicts fixed but you are still merging.", c: "accent" });
      out.push({ s: '  (use "git merge --continue" to conclude)', c: "dim" });
    }
    const staged = [...stagedAdd, ...stagedMod, ...stagedDel];
    if (staged.length) {
      out.push({ s: "", c: "plain" });
      out.push({ s: "Changes to be committed:", c: "accent" });
      out.push({ s: '  (use "git restore --staged <file>..." to unstage)', c: "dim" });
      for (const p of stagedAdd) out.push({ s: `  new file:   ${p}`, c: "ok" });
      for (const p of stagedMod) out.push({ s: `  modified:   ${p}`, c: "ok" });
      for (const p of stagedDel) out.push({ s: `  deleted:    ${p}`, c: "ok" });
    }
    if (unstaged.length) {
      out.push({ s: "", c: "plain" });
      out.push({ s: "Changes not staged for commit:", c: "accent" });
      out.push({ s: '  (use "git add <file>..." to update what will be committed)', c: "dim" });
      for (const p of unstaged) out.push({ s: `  modified:   ${p}`, c: "warn" });
    }
    if (untracked.length) {
      out.push({ s: "", c: "plain" });
      out.push({ s: "Untracked files:", c: "accent" });
      for (const p of untracked) out.push({ s: `  ${p}`, c: "dim" });
    }
    if (!staged.length && !unstaged.length && !untracked.length && !this.conflicts.size) {
      out.push({ s: "nothing to commit, working tree clean", c: "dim" });
    }
    return out;
  }

  private async shortStatus(): Promise<Line[]> {
    const matrix = await this.statusMatrix();
    const out: Line[] = [];
    const push = (xy: string, p: string) => {
      const tone: Tone = xy === "UU" ? "danger" : xy.trim() === "A" || xy.trim() === "D" ? "ok" : xy.trim() === "??" ? "dim" : "warn";
      out.push({ s: `${xy} ${p}`, c: tone });
    };
    for (const [path, h, w, s] of matrix) {
      if (this.conflicts.has(path)) {
        push("UU", path);
        continue;
      }
      const state = this.classify(h, w, s, path);
      if (state === "staged") push(h === 0 ? "A " : w === 0 ? "D " : "M ", path);
      else if (state === "new") push("??", path);
      else if (state === "deleted") push(" D", path);
      else if (state === "modified") push(" M", path);
    }
    if (!out.length) out.push({ s: "nothing to commit, working tree clean", c: "dim" });
    return out;
  }

  private async add(args: string[]): Promise<Line[]> {
    const out: Line[] = [];
    let any = false;
    const targets = args.filter((a) => !a.startsWith("-"));
    const all = targets.length === 0 || targets.includes(".");
    const matrix = await this.statusMatrix();
    const workSet = new Set((await this.listWorkFiles()).map((f) => f.path));
    const trackedSet = new Set<string>();
    for (const [p, h, , ,] of matrix) if (h === 1) trackedSet.add(p);
    let list: string[] = [];
    if (all) {
      list = [...new Set([...workSet, ...trackedSet])];
    } else {
      for (const p of targets) {
        if (!workSet.has(p) && !trackedSet.has(p)) {
          out.push({ s: `fatal: pathspec '${p}' did not match any files`, c: "danger" });
          continue;
        }
        list.push(p);
      }
    }
    list.sort();
    const stateOf = (p: string): FileState => {
      const row = matrix.find((m) => m[0] === p);
      return row ? this.classify(row[1], row[2], row[3], p) : "unchanged";
    };
    const stagedLines: Line[] = [];
    let stagedCount = 0;
    for (const path of list) {
      const wasConflict = this.conflicts.has(path);
      const workdirExists = workSet.has(path);
      if (wasConflict) {
        const content = await this.readWorkFile(path);
        if (MARKED.test(content)) {
          out.push({ s: `${path} still contains conflict markers — remove <<<<<<< / ======= / >>>>>>> first`, c: "warn" });
          continue;
        }
        this.conflicts.delete(path);
        out.push({ s: `Resolved: git add ${path}`, c: "ok" });
      }
      const before = stateOf(path);
      if (before === "staged" && list.length === 1 && !wasConflict && workdirExists) {
        out.push({ s: `'${path}' is already staged — nothing to add.`, c: "dim" });
        continue;
      }
      if (!workdirExists && !wasConflict && before !== "staged") {
        await Git.remove({ fs: this.fs!, cache: this.cache, dir: this.dir, filepath: path });
        any = true;
        stagedCount++;
        stagedLines.push({ s: `  deleted:     ${path}`, c: "warn" });
        continue;
      }
      if (before === "unchanged" && !wasConflict) continue;
      await Git.add({ fs: this.fs!, cache: this.cache, dir: this.dir, filepath: path });
      any = true;
      stagedCount++;
      if (wasConflict) stagedLines.push({ s: `  resolved:    ${path}`, c: "ok" });
      else if (before === "new") stagedLines.push({ s: `  new file:    ${path}`, c: "ok" });
      else stagedLines.push({ s: `  modified:    ${path}`, c: "warn" });
    }
    if (!any && !out.length) return [{ s: "Nothing to add.", c: "dim" }];
    if (stagedLines.length) {
      out.push({ s: `Staged ${stagedCount} file${stagedCount === 1 ? "" : "s"}:`, c: "accent" });
      out.push(...stagedLines);
    } else if (!out.length) {
      out.push({ s: "Staged.", c: "ok" });
    }
    return out;
  }

  private async commitmentRef(): Promise<{ name: string; email: string }> {
    return this.configuredAuthor();
  }

  private async commit(args: string[]): Promise<Line[]> {
    if (this.rebaseState) {
      return [
        { s: "error: you are mid-rebase — record a resolution with 'git rebase --continue'.", c: "danger" },
        { s: "       (stash-style 'git commit' is not used during a rebase)", c: "dim" },
      ];
    }
    if (this.cherryState) {
      return [{ s: "error: you are mid-cherry-pick — finish it with 'git cherry-pick --continue' (or --abort).", c: "danger" }];
    }
    if (this.revertState) {
      return [{ s: "error: you are mid-revert — finish it with 'git revert --continue' (or --abort).", c: "danger" }];
    }
    const mIdx = args.indexOf("-m");
    let msg = mIdx !== -1 ? args[mIdx + 1] ?? "" : "";
    if (!msg && args.includes("--message")) msg = args[args.indexOf("--message") + 1] ?? "";
    const stagedAny = (await this.statusMatrix()).some(([, , , s]) => s === 2 || s === 3);
    if (!this.mergeState) {
      if (!stagedAny && !(await this.hasStaged())) return [{ s: "nothing to commit, working tree clean", c: "dim" }];
    } else {
      if (!msg) msg = "Merge done";
      if (this.conflicts.size) {
        const out: Line[] = [{ s: `You still have ${this.conflicts.size} unresolved path${this.conflicts.size > 1 ? "s" : ""}:`, c: "danger" }];
        for (const p of [...this.conflicts].sort()) out.push({ s: `  both modified: ${p}`, c: "danger" });
        out.push({ s: "Resolve them, then stage with git add <file>.", c: "warn" });
        return out;
      }
    }
    if (!msg) return [{ s: 'error: commit message required (git commit -m "your message")', c: "danger" }];
    const parent = this.mergeState ? [this.mergeState.oursId, this.mergeState.theirsId] : undefined;
    try {
      const who = await this.commitmentRef();
      const oid = await Git.commit({
        fs: this.fs!, cache: this.cache,
        dir: this.dir,
        message: msg,
        author: who,
        committer: who,
        parent: parent as never,
      });
      this.conflicts.clear();
      const wasMerge = this.mergeState !== null;
      this.mergeState = null;
      const short = oid.slice(0, 7);
      this.refentry(wasMerge ? `merge: ${msg}` : `commit: ${msg}`);
      if (wasMerge) {
        return [
          { s: "Merge made by the 'ort' strategy.", c: "ok" },
          { s: `  ${short} ${msg}`, c: "dim" },
        ];
      }
      return [
        { s: `[${await this.currentBranchName()} ${short}] ${msg}`, c: "ok" },
        { s: `${await this.changedCount(oid)}`, c: "dim" },
      ];
    } catch (err) {
      this.terminal.pop();
      return [{ s: `fatal: ${err instanceof Error ? err.message : String(err)}`, c: "danger" }];
    }
  }

  private async hasStaged(): Promise<boolean> {
    return (await this.statusMatrix()).some(([, , , s]) => s === 2 || s === 3);
  }

  private async changedCount(oid: string): Promise<string> {
    try {
      const c = await Git.readCommit({ fs: this.fs!, cache: this.cache, dir: this.dir, oid });
      const parent = c.commit.parent[0];
      let n = 0;
      if (parent) {
        const a = new Set(await Git.listFiles({ fs: this.fs!, cache: this.cache, dir: this.dir, ref: parent }));
        const b = new Set(await Git.listFiles({ fs: this.fs!, cache: this.cache, dir: this.dir, ref: oid }));
        n = [...new Set([...a, ...b])].length;
      } else {
        n = (await Git.listFiles({ fs: this.fs!, cache: this.cache, dir: this.dir, ref: oid })).length;
      }
      return `${n} file${n === 1 ? "" : "s"} changed`;
    } catch {
      return "";
    }
  }

  private async logCmd(args: string[]): Promise<Line[]> {
    const oneline = args.includes("--oneline");
    const out: Line[] = [];
    try {
      const commits = await Git.log({ fs: this.fs!, cache: this.cache, dir: this.dir, ref: "HEAD" });
      for (const c of commits) {
        const chips = await this.chips(c.oid);
        if (oneline) {
          out.push({ s: `${c.oid.slice(0, 7)}${chips} ${c.commit.message.split("\n")[0]}`, c: "plain" });
        } else {
          out.push({ s: `commit ${c.oid}${chips}`, c: "accent" });
          out.push({ s: `Author: ${c.commit.author.name} <${c.commit.author.email}>`, c: "dim" });
          out.push({ s: `Date:   ${new Date(c.commit.author.timestamp * 1000).toUTCString().replace("GMT", "+0000")}`, c: "dim" });
          out.push({ s: "", c: "plain" });
          out.push({ s: `    ${c.commit.message}`, c: "plain" });
          out.push({ s: "", c: "plain" });
        }
      }
    } catch {
      return [{ s: "No commits yet.", c: "dim" }];
    }
    if (!oneline && out.length) out.pop();
    return out.length ? out : [{ s: "No commits yet.", c: "dim" }];
  }

  private async branch(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    if (!args.length) {
      const cur = await this.currentBranchName();
      const out: Line[] = [];
      for (const name of await Git.listBranches({ fs: this.fs, dir: this.dir })) {
        try {
          const id = await Git.resolveRef({ fs: this.fs, dir: this.dir, ref: name });
          const c = await Git.readCommit({ fs: this.fs, cache: this.cache, dir: this.dir, oid: id });
          out.push({ s: `${name === cur ? "* " : "  "}${name} ${c.commit.message.split("\n")[0]}`, c: name === cur ? ("accent" as Tone) : "plain" });
        } catch {
          out.push({ s: `${name === cur ? "* " : "  "}${name}`, c: "plain" });
        }
      }
      return out;
    }
    const flag = args[0];
    if (flag === "-d" || flag === "-D") {
      const name = args[1];
      try {
        await Git.deleteBranch({ fs: this.fs, dir: this.dir, ref: name });
        return [{ s: `Deleted branch ${name}${flag === "-D" ? " (force)" : ""}.`, c: "ok" }];
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return [{ s: `error: ${msg}`, c: "danger" }];
      }
    }
    const name = flag;
    try {
      await Git.branch({ fs: this.fs, dir: this.dir, ref: name, checkout: false });
      return [{ s: `Created branch ${name}.`, c: "ok" }];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `fatal: ${msg}`, c: "danger" }];
    }
  }

  private async switchTo(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const ci = args.findIndex((a) => a === "-c" || a === "-b");
    const create = ci !== -1;
    const name = create ? args[ci + 1] : args[0];
    if (!name) return [{ s: "Usage: git switch <branch>  |  git switch -c <name>", c: "warn" }];
    if (this.mergeState) return [{ s: "You are mid-merge. Resolve or --abort before switching.", c: "danger" }];
    if (this.rebaseState) return [{ s: "You are mid-rebase. Resolve and --continue, or --abort before switching.", c: "danger" }];
    if (await this.hasDirty()) {
      const out: Line[] = [{ s: "Your local changes would be overwritten by switching branches.\n(error: commit or stash them first)", c: "danger" }];
      return out;
    }
    try {
      if (create) {
        await Git.branch({ fs: this.fs, dir: this.dir, ref: name, checkout: true });
        this.refentry(`checkout: moving to ${name}`);
        return [{ s: `Switched to a new branch '${name}'`, c: "ok" }];
      }
      await Git.checkout({ fs: this.fs, cache: this.cache, dir: this.dir, ref: name });
      this.refentry(`checkout: moving to ${name}`);
      return [{ s: `Switched to branch '${name}'`, c: "ok" }];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `fatal: ${msg}`, c: "danger" }];
    }
  }

  private async hasDirty(): Promise<boolean> {
    const matrix = await this.statusMatrix();
    for (const [path, h, w, s] of matrix) {
      if (this.conflicts.has(path)) continue;
      if (!(h === 1 && w === 1 && s === 1)) return true;
    }
    return false;
  }

  private async merge(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    if (args[0] === "--abort") return this.mergeAbort();
    if (args[0] === "--continue") {
      if (!this.mergeState) return [{ s: "fatal: there is no merge in progress", c: "danger" }];
      if (this.conflicts.size) {
        const out: Line[] = [{ s: `You still have ${this.conflicts.size} unresolved path${this.conflicts.size > 1 ? "s" : ""}:`, c: "danger" }];
        for (const p of [...this.conflicts].sort()) out.push({ s: `  both modified: ${p}`, c: "danger" });
        out.push({ s: "Resolve them, then stage with git add <file>.", c: "warn" });
        return out;
      }
      const msg = (() => {
        const mi = args.indexOf("-m");
        return mi !== -1 ? args[mi + 1] ?? "Merge done" : "Merge done";
      })();
      return this.commit(["-m", msg]);
    }
    const branch = args[0];
    if (!branch) return [{ s: "usage: git merge <branch>", c: "warn" }];
    if (this.mergeState) return [{ s: "You are already mid-merge. Resolve + git add, then merge --continue (or --abort).", c: "danger" }];
    let theirsId: string;
    try {
      theirsId = await Git.resolveRef({ fs: this.fs, dir: this.dir, ref: branch });
    } catch {
      return [{ s: `merge: ${branch} - not a valid ref`, c: "danger" }];
    }
    const oursId = await this.headOid();
    const oursName = await this.currentBranchName();
    if (oursId === theirsId) return [{ s: "Already up to date.", c: "dim" }];
    if (await this.hasDirty()) return [{ s: "error: Your local changes would be overwritten by the merge. Commit or stash first.", c: "danger" }];
    const base = await Git.findMergeBase({ fs: this.fs, cache: this.cache, dir: this.dir, oids: [oursId, theirsId] });
    if (!base.length) return [{ s: "fatal: refusing to merge unrelated histories", c: "danger" }];
    if (base.includes(theirsId)) return [{ s: "Already up to date.", c: "dim" }];
    try {
      const who = await this.configuredAuthor();
      const res = await Git.merge({
        fs: this.fs, cache: this.cache,
        dir: this.dir,
        ours: oursName,
        theirs: branch,
        message: `Merge branch '${branch}'`,
        author: who,
        committer: who,
        abortOnConflict: false,
      });
      if (res.fastForward) {
        await Git.checkout({ fs: this.fs, dir: this.dir, ref: await this.headOid(), force: true });
        this.refentry(`merge ${branch}: Fast-forward`);
        return [{ s: `Fast-forward from your HEAD to ${branch}.`, c: "ok" }];
      }
      this.refentry(`merge ${branch}: Merge made by the 'ort' strategy.`);
      return [{ s: `Merge made by the 'ort' strategy.`, c: "ok" }];
    } catch (err) {
      if (err instanceof Errors.MergeConflictError || err instanceof Errors.MergeNotSupportedError) {
        await this.refreshConflicts();
        if (!this.conflicts.size) {
          this.mergeState = { oursId, theirsId, branch };
          return this.commit(["-m", `Merge branch '${branch}'`]);
        }
        this.mergeState = { oursId, theirsId, branch };
        const out: Line[] = [];
        for (const p of [...this.conflicts].sort()) out.push({ s: `CONFLICT (content): Merge conflict in ${p}`, c: "danger" });
        out.push({ s: "Automatic merge failed; fix conflicts and then:", c: "plain" });
        out.push({ s: "  1. click the file in the editor (right)", c: "accent" });
        out.push({ s: "  2. remove the <<<<<<< / ======= / >>>>>>> markers and keep both sides", c: "accent" });
        out.push({ s: '  3.  git add <file>    4.  git merge --continue', c: "accent" });
        out.push({ s: "Or give up cleanly with:  git merge --abort", c: "dim" });
        return out;
      }
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `error: merge failed — ${msg}`, c: "danger" }];
    }
  }

  private async mergeAbort(): Promise<Line[]> {
    if (!this.fs || !this.mergeState) return [{ s: "fatal: there is no merge to abort (git merge --abort)", c: "danger" }];
    try {
      await Git.abortMerge({ fs: this.fs, cache: this.cache, dir: this.dir });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `error: ${msg}`, c: "danger" }];
    }
    this.conflicts.clear();
    this.mergeState = null;
    return [{ s: "Merge aborted. Your working tree is back — nothing was committed.", c: "ok" }];
  }

  private async rebaseCmd(args: string[]): Promise<Line[]> {
    if (this.rebaseState) {
      const op = args[0];
      if (op === "--continue") return this.rebaseContinue();
      if (op === "--abort") return this.rebaseAbort();
      return [
        { s: "error: you are already rebasing — finish with 'git rebase --continue' or 'git rebase --abort'.", c: "danger" },
      ];
    }
    if (args[0] === "--abort" || args[0] === "--continue") {
      return [{ s: "fatal: no rebase in progress", c: "danger" }];
    }
    if (args[0] === "-i" || args[0] === "--interactive") {
      return [{ s: "interactive rebase ('-i') isn't supported in this sandbox — use the plain flow: git rebase <branch>", c: "warn" }];
    }
    const upstream = args[0];
    if (!upstream) return [{ s: "usage: git rebase <upstream-branch>   (then --continue / --abort)", c: "warn" }];
    if (this.mergeState) return [{ s: "error: cannot rebase while a merge is in progress — finish or --abort it first.", c: "danger" }];
    const branch = await this.currentBranchName();
    if (await this.hasDirty()) return [{ s: "error: cannot rebase: You have unstaged changes. Commit or stash them first.", c: "danger" }];
    let upstreamOid: string;
    try {
      upstreamOid = await Git.resolveRef({ fs: this.fs!, dir: this.dir, ref: upstream });
    } catch {
      return [{ s: `fatal: invalid upstream '${upstream}'`, c: "danger" }];
    }
    const ours = await this.headOid();
    if (ours === upstreamOid) return [{ s: `Current branch ${branch} is up to date.`, c: "dim" }];
    const base = await Git.findMergeBase({ fs: this.fs!, dir: this.dir, cache: this.cache, oids: [ours, upstreamOid] });
    if (!base.length) return [{ s: "fatal: refusing to rebase unrelated histories", c: "danger" }];
    if (base.includes(upstreamOid)) return [{ s: `Current branch ${branch} is up to date.`, c: "dim" }];
    if (base.includes(ours)) {
      await Git.branch({ fs: this.fs!, dir: this.dir, ref: branch, object: upstreamOid, force: true, checkout: true });
      return [{ s: `Fast-forwarded ${branch} to ${upstream}.`, c: "ok" }];
    }
    const plan: RebaseStep[] = [];
    let cur = ours;
    let guard = 0;
    while (cur !== base[0] && guard++ < 500) {
      const { commit } = await Git.readCommit({ fs: this.fs!, dir: this.dir, cache: this.cache, oid: cur });
      if (commit.parent.length > 1) return [{ s: "error: cannot rebase merge commits in this sandbox yet.", c: "danger" }];
      plan.unshift({ oid: cur, msg: commit.message, author: commit.author });
      if (!commit.parent.length) return [{ s: `fatal: commit ${cur.slice(0, 7)} is a root — can't rebase onto it here.`, c: "danger" }];
      cur = commit.parent[0];
    }
    if (!plan.length) return [{ s: `Current branch ${branch} is up to date.`, c: "dim" }];
    await Git.checkout({ fs: this.fs!, dir: this.dir, cache: this.cache, ref: upstreamOid, force: true });
    this.rebaseState = {
      branch,
      prevOid: upstreamOid,
      total: plan.length,
      done: 0,
      onLabel: upstream,
      plan,
      paused: null,
    };
    return this.replayRemaining();
  }

  private async rebaseContinue(): Promise<Line[]> {
    const st = this.rebaseState;
    if (!st) return [{ s: "fatal: no rebase in progress", c: "danger" }];
    if (this.conflicts.size) {
      const out: Line[] = [
        { s: `You still have ${this.conflicts.size} unresolved path${this.conflicts.size > 1 ? "s" : ""}:`, c: "danger" },
      ];
      for (const p of [...this.conflicts].sort()) out.push({ s: `  both modified:   ${p}`, c: "danger" });
      out.push({ s: "Resolve the markers, then stage with git add <file>.", c: "warn" });
      return out;
    }
    const out: Line[] = [];
    if (st.paused) {
      const confMsg = st.paused.msg;
      const who = await this.configuredAuthor();
      const oid = await Git.commit({
        fs: this.fs!,
        dir: this.dir,
        cache: this.cache,
        parent: [st.prevOid],
        message: confMsg,
        author: st.paused.author,
        committer: who,
      });
      st.prevOid = oid;
      st.paused = null;
      this.conflicts.clear();
      out.push({ s: `Applied: ${oid.slice(0, 7)} ${confMsg.split("\n")[0]}`, c: "dim" });
    }
    out.push(...(await this.replayRemaining()));
    if (!this.rebaseState && !this.conflicts.size) return out;
    return out;
  }

  private async rebaseAbort(): Promise<Line[]> {
    const st = this.rebaseState;
    if (!st) return [{ s: "fatal: no rebase in progress", c: "danger" }];
    this.rebaseState = null;
    this.conflicts.clear();
    try {
      await Git.checkout({ fs: this.fs!, dir: this.dir, cache: this.cache, ref: st.branch, force: true });
      this.refentry(`rebase (abort): returning to ${st.branch}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `fatal: ${msg}`, c: "danger" }];
    }
    return [{ s: "Aborted. Your branch is back where it was.", c: "ok" }];
  }

  private async replayRemaining(): Promise<Line[]> {
    const out: Line[] = [];
    while (this.rebaseState && this.rebaseState.plan.length) {
      const st = this.rebaseState;
      const step = st.plan.shift()!;
      st.done += 1;
      out.push({ s: `Rebasing (${st.done}/${st.total})`, c: "dim" });
      const res = await this.applyRebaseCommit(step);
      out.push(...res.lines);
      if (res.conflicts) {
        st.paused = step;
        break;
      }
      st.prevOid = res.oid!;
    }
    if (this.rebaseState && !this.rebaseState.plan.length) {
      const st = this.rebaseState;
      await Git.branch({ fs: this.fs!, dir: this.dir, ref: st.branch, object: st.prevOid, force: true, checkout: true });
      this.refentry(`rebase (finished): refs/heads/${st.branch} onto ${st.onLabel}`);
      out.push({ s: `Successfully rebased and updated refs/heads/${st.branch}.`, c: "ok" });
      this.rebaseState = null;
      this.conflicts.clear();
    }
    return out;
  }

  private async applyRebaseCommit(step: RebaseStep): Promise<{ lines: Line[]; conflicts: boolean; oid?: string }> {
    const { commit } = await Git.readCommit({ fs: this.fs!, dir: this.dir, cache: this.cache, oid: step.oid });
    const parent = commit.parent[0];
    const lines: Line[] = [];
    if (!parent) {
      lines.push({ s: `error: ${step.oid.slice(0, 7)} is a root commit — can't rebase it here.`, c: "danger" });
      return { lines, conflicts: true };
    }
    const filesA = new Set(await Git.listFiles({ fs: this.fs!, dir: this.dir, cache: this.cache, ref: step.oid }));
    const filesP = new Set(await Git.listFiles({ fs: this.fs!, dir: this.dir, cache: this.cache, ref: parent }));
    const paths = [...new Set([...filesP, ...filesA])].sort();
    const conflicted: string[] = [];
    for (const path of paths) {
      const inA = filesA.has(path);
      const inP = filesP.has(path);
      const a = inP ? await this.refBlob(parent, path) : "";
      const ctxt = inA ? await this.refBlob(step.oid, path) : "";
      const cur = (await this.workExists(path)) ? await this.readWorkFile(path) : "";
      if (inA && inP && a === ctxt) continue;
      if (cur === a) {
        if (!inA) {
          try {
            await Git.remove({ fs: this.fs!, dir: this.dir, cache: this.cache, filepath: path });
          } catch {}
          continue;
        }
        if (cur === ctxt) continue;
        await this.setWorkFile(path, ctxt);
        continue;
      }
      if (cur === ctxt) continue;
      conflicted.push(path);
      const theirs = `${step.oid.slice(0, 7)} ${step.msg.split("\n")[0].trim()}`;
      await this.setWorkFile(path, `<<<<<<< HEAD\n${cur}\n=======\n${ctxt}\n>>>>>>> ${theirs}\n`);
    }
    await Git.add({ fs: this.fs!, dir: this.dir, cache: this.cache, filepath: "." });
    if (conflicted.length) {
      this.conflicts = new Set(conflicted);
      for (const p of conflicted) lines.push({ s: `CONFLICT (content): Merge conflict in ${p}`, c: "danger" });
      lines.push({ s: `error: could not apply ${step.oid.slice(0, 7)}... ${step.msg.split("\n")[0].trim()}`, c: "danger" });
      lines.push({ s: "hint: Resolve all conflicts manually, mark them as resolved with", c: "dim" });
      lines.push({ s: 'hint: "git add <conflicted_files>", then run "git rebase --continue".', c: "dim" });
      lines.push({ s: 'You can give up instead with "git rebase --abort".', c: "dim" });
      return { lines, conflicts: true };
    }
    let oid: string;
    try {
      const who = await this.configuredAuthor();
      oid = await Git.commit({
        fs: this.fs!,
        dir: this.dir,
        cache: this.cache,
        parent: [this.rebaseState!.prevOid],
        message: step.msg,
        author: step.author,
        committer: who,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lines.push({ s: `error: ${msg}`, c: "danger" });
      return { lines, conflicts: true };
    }
    return { lines, conflicts: false, oid };
  }

  private async refBlob(oid: string, path: string): Promise<string> {
    try {
      const { blob } = await Git.readBlob({ fs: this.fs!, dir: this.dir, cache: this.cache, oid, filepath: path });
      return Buffer.from(blob).toString("utf8");
    } catch {
      return "";
    }
  }

  private async workExists(path: string): Promise<boolean> {
    if (!this.fs) return false;
    try {
      await this.fs.promises.stat(`${this.dir}/${path}`);
      return true;
    } catch {
      return false;
    }
  }

  // ---- config ----

  private async configCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    if (args.includes("--list") || args.includes("-l")) {
      const out: Line[] = [];
      try {
        const buf = await this.fs.promises.readFile(`${this.dir}/.git/config`);
        const text = Buffer.from(buf).toString("utf8");
        let section = "";
        for (const raw of text.split("\n")) {
          const line = raw.trim();
          if (!line || line.startsWith("#") || line.startsWith(";")) continue;
          const sec = line.match(/^\[(\S+)(?:\s+"([^"]+)")?\]$/);
          if (sec) {
            section = sec[2] ? `${sec[1]}.${sec[2]}` : sec[1];
            continue;
          }
          const kv = line.match(/^([^=]+)=(.+)$/);
          if (kv && section) {
            out.push({ s: `${section}.${kv[1].trim().toLowerCase()}=${kv[2].trim()}`, c: "plain" });
          }
        }
      } catch {}
      return out.length ? out : [{ s: "No config set yet. Try: git config user.name \"You\"", c: "dim" }];
    }

    // filter out --global or --local since isomorphic-git only writes to the local sandbox
    const cleanArgs = args.filter(a => a !== "--global" && a !== "--local" && a !== "--system");

    const flag = cleanArgs[0];
    if (flag === "--unset" || flag === "-u") {
      const path = cleanArgs[1];
      if (!path) return [{ s: "usage: git config --unset <key>", c: "warn" }];
      await Git.setConfig({ fs: this.fs, dir: this.dir, path, value: undefined });
      return [];
    }

    const key = flag;
    const value = cleanArgs[1];
    if (!key) return [{ s: "usage: git config <key> <value>  |  git config <key>  |  --list | --unset <key>", c: "warn" }];

    if (value === undefined) {
      try {
        const v = await Git.getConfig({ fs: this.fs, dir: this.dir, path: key });
        return v ? [{ s: String(v), c: "plain" }] : [];
      } catch {
        return [];
      }
    }

    await Git.setConfig({ fs: this.fs, dir: this.dir, path: key, value });
    return [];
  }

  // ---- tag ----

  private async tagCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    if (!args.length) {
      const tags = await Git.listTags({ fs: this.fs, dir: this.dir });
      return tags.length ? tags.map((t) => ({ s: t, c: "plain" as Tone })) : [{ s: "No tags yet.", c: "dim" }];
    }
    if (args[0] === "-d" || args[0] === "--delete") {
      const name = args[1];
      if (!name) return [{ s: "usage: git tag -d <name>", c: "warn" }];
      try {
        const old = await Git.resolveRef({ fs: this.fs, dir: this.dir, ref: `refs/tags/${name}` });
        await Git.deleteTag({ fs: this.fs, dir: this.dir, ref: name });
        return [{ s: `Deleted tag '${name}' (was ${old.slice(0, 7)})`, c: "ok" }];
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return [{ s: `error: ${msg}`, c: "danger" }];
      }
    }
    const name = args[0];
    if (!name || name.startsWith("-")) return [{ s: "usage: git tag <name> [<commit>]   |   git tag   |   git tag -d <name>", c: "warn" }];
    const target = args[1] ? await this.refId(args[1]) : await this.headOid();
    if (!target) return [{ s: `fatal: Failed to resolve '${args[1] ?? "HEAD"}' as a valid ref.`, c: "danger" }];
    try {
      await Git.tag({ fs: this.fs, dir: this.dir, ref: name, object: target, force: args.includes("-f") || args.includes("--force") });
      return [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `fatal: ${msg}`, c: "danger" }];
    }
  }

  // ---- clean ----

  private async cleanCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    if (!args.includes("-f") && !args.includes("--force") && !args.includes("-n")) {
      return [{ s: "error: clean requires -f to remove files, or -n to preview (git clean -fd / -fdn).", c: "danger" }];
    }
    const dry = args.includes("-n");
    const matrix = await this.statusMatrix();
    const untracked = matrix.filter((r) => this.classify(r[1], r[2], r[3], r[0]) === "new").map((r) => r[0]);
    const dirs = new Set<string>();
    const out: Line[] = [];
    for (const rel of untracked.sort()) {
      if (dry) {
        out.push({ s: `Would remove ${rel}`, c: "dim" });
        continue;
      }
      try {
        await this.fs.promises.unlink(`${this.dir}/${rel}`);
        dirs.add(rel.split("/").slice(0, -1).join("/"));
        out.push({ s: `Removing ${rel}`, c: "dim" });
      } catch {}
    }
    if (!dry && args.includes("-d")) {
      for (const d of [...dirs].sort((a, b) => b.length - a.length)) {
        if (!d) continue;
        try {
          await this.fs.promises.rmdir(`${this.dir}/${d}`);
        } catch {}
      }
    }
    if (!out.length) out.push({ s: dry ? "Nothing would be removed." : "Nothing to remove.", c: "dim" });
    return out;
  }

  // ---- restore ----

  private async restoreCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const staged = args.includes("--staged") || args.includes("-S");
    const path = args.filter((a) => !a.startsWith("-")).pop();
    if (!path) return [{ s: "usage: git restore [--staged] <file>", c: "warn" }];
    if (staged) {
      try {
        await Git.resetIndex({ fs: this.fs, dir: this.dir, filepath: path, cache: this.cache });
        this.conflicts.delete(path);
        return [{ s: `Staged changes to '${path}' un-staged (git restore --staged ${path})`, c: "ok" }];
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return [{ s: `error: ${msg}`, c: "danger" }];
      }
    }
    const content = await this.headBlob(path);
    if (content === "") {
      try {
        const exists = await this.workExists(path);
        if (exists) {
          await this.fs.promises.unlink(`${this.dir}/${path}`);
          return [{ s: `'${path}' restored — removed from the working tree (matches HEAD).`, c: "ok" }];
        }
      } catch {}
      return [{ s: `error: path '${path}' does not match any source in HEAD`, c: "danger" }];
    }
    await this.setWorkFile(path, content);
    return [{ s: `'${path}' restored from HEAD.`, c: "ok" }];
  }

  // ---- cherry-pick ----

  private async cherryCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    if (args[0] === "--abort") {
      if (!this.cherryState) return [{ s: "fatal: There is no cherry-pick in progress.", c: "danger" }];
      this.cherryState = null;
      this.conflicts.clear();
      const head = await this.headOid();
      await Git.checkout({ fs: this.fs, dir: this.dir, ref: head, force: true });
      await Git.resetIndex({ fs: this.fs, dir: this.dir, filepath: "." }).catch(() => {});
      this.refentry("cherry-pick: abort");
      return [{ s: "Cherry-pick aborted. Your branch is back where it was.", c: "ok" }];
    }
    if (args[0] === "--continue") {
      const st = this.cherryState;
      if (!st) return [{ s: "fatal: There is no cherry-pick in progress.", c: "danger" }];
      if (this.conflicts.size) return [{ s: `You still have ${this.conflicts.size} unresolved path(s) — resolve markers, git add <file>, then continue.`, c: "danger" }];
      const who = await this.configuredAuthor();
      const head = await this.headOid();
      const oid = await Git.commit({
        fs: this.fs, dir: this.dir, cache: this.cache,
        parent: [head],
        message: st.msg,
        author: st.author,
        committer: who,
      });
      this.cherryState = null;
      this.conflicts.clear();
      this.refentry(`cherry-pick: ${st.msg.split("\n")[0]}`);
      return [{ s: `[${await this.currentBranchName()} ${oid.slice(0, 7)}] ${st.msg.split("\n")[0]}`, c: "ok" }];
    }
    if (this.cherryState) return [{ s: "You are already mid-cherry-pick. Resolve + git add, then --continue (or --abort).", c: "danger" }];
    const ref = args[0];
    if (!ref) return [{ s: "usage: git cherry-pick <commit>", c: "warn" }];
    if (this.mergeState || this.rebaseState) return [{ s: "error: a merge/rebase is in progress — finish it first.", c: "danger" }];
    let target: string;
    try {
      target = await this.refId(ref);
    } catch {
      return [{ s: `error: bad revision '${ref}'`, c: "danger" }];
    }
    if (!target) return [{ s: `error: bad revision '${ref}'`, c: "danger" }];
    const c = await Git.readCommit({ fs: this.fs, dir: this.dir, cache: this.cache, oid: target });
    const who = await this.configuredAuthor();
    try {
      const oid = await Git.cherryPick({
        fs: this.fs, dir: this.dir, cache: this.cache,
        oid: target,
        committer: who,
        noUpdateBranch: false,
      });
      this.refentry(`cherry-pick: ${c.commit.message.split("\n")[0]}`);
      const count = await this.changedCount(oid);
      return [
        { s: `[${await this.currentBranchName()} ${oid.slice(0, 7)}] ${c.commit.message.split("\n")[0]}`, c: "ok" },
        { s: count, c: "dim" },
      ];
    } catch (err) {
      if (this.catchConflictError(err)) {
        await this.refreshConflicts();
        this.cherryState = { oid: target, msg: c.commit.message, author: c.commit.author };
        const out: Line[] = [];
        for (const p of [...this.conflicts].sort()) out.push({ s: `CONFLICT (content): Merge conflict in ${p}`, c: "danger" });
        out.push({ s: `error: could not apply ${target.slice(0, 7)}... ${c.commit.message.split("\n")[0]}`, c: "danger" });
        out.push({ s: 'hint: Resolve the markers, stage with "git add <file>", then "git cherry-pick --continue".', c: "dim" });
        out.push({ s: 'You can give up instead with "git cherry-pick --abort".', c: "dim" });
        return out;
      }
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `error: ${msg}`, c: "danger" }];
    }
  }

  // ---- revert ----

  private async revertCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    if (args[0] === "--abort") {
      if (!this.revertState) return [{ s: "fatal: There is no revert in progress.", c: "danger" }];
      this.revertState = null;
      this.conflicts.clear();
      const head = await this.headOid();
      await Git.checkout({ fs: this.fs, dir: this.dir, ref: head, force: true });
      await Git.resetIndex({ fs: this.fs, dir: this.dir, filepath: "." }).catch(() => {});
      this.refentry("revert: abort");
      return [{ s: "Revert aborted. Nothing was changed.", c: "ok" }];
    }
    if (args[0] === "--continue") {
      const st = this.revertState;
      if (!st) return [{ s: "fatal: There is no revert in progress.", c: "danger" }];
      if (this.conflicts.size) return [{ s: `You still have ${this.conflicts.size} unresolved path(s) — resolve markers, git add <file>, then continue.`, c: "danger" }];
      const who = await this.configuredAuthor();
      const head = await this.headOid();
      const oid = await Git.commit({
        fs: this.fs, dir: this.dir, cache: this.cache,
        parent: [head],
        message: st.msg,
        author: st.author,
        committer: who,
      });
      this.revertState = null;
      this.conflicts.clear();
      this.refentry(`revert: ${st.msg.split("\n")[0]}`);
      return [
        { s: `[${await this.currentBranchName()} ${oid.slice(0, 7)}] ${st.msg.split("\n")[0]}`, c: "ok" },
        { s: await this.changedCount(oid), c: "dim" },
      ];
    }
    if (this.revertState) return [{ s: "You are already mid-revert. Resolve + git add, then --continue (or --abort).", c: "danger" }];
    const ref = args[0];
    if (!ref) return [{ s: "usage: git revert <commit>", c: "warn" }];
    if (this.mergeState || this.rebaseState || this.cherryState) return [{ s: "error: a merge/rebase/cherry-pick is in progress — finish it first.", c: "danger" }];
    let target: string;
    try {
      target = await this.refId(ref);
    } catch {
      return [{ s: `error: bad revision '${ref}'`, c: "danger" }];
    }
    if (!target) return [{ s: `error: bad revision '${ref}'`, c: "danger" }];
    if (target === (await this.headOid())) return [{ s: "error: cannot revert a commit that is already on HEAD — it would be a no-op.", c: "warn" }];
    const c = await Git.readCommit({ fs: this.fs, dir: this.dir, cache: this.cache, oid: target });
    const parent = c.commit.parent[0];
    if (!parent) return [{ s: `error: cannot revert the root commit ${target.slice(0, 7)}.`, c: "danger" }];
    const msg = `Revert "${c.commit.message.split("\n")[0]}"`;
    const res = await this.reverseApply({ oid: target, parent, msg, author: c.commit.author });
    if (res.oid) {
      this.refentry(`revert: ${msg.split("\n")[0]}`);
      return [
        { s: `[${await this.currentBranchName()} ${res.oid.slice(0, 7)}] ${msg}`, c: "ok" },
        { s: await this.changedCount(res.oid), c: "dim" },
      ];
    }
    this.revertState = { oid: target, msg, author: c.commit.author };
    this.conflicts = res.conflicts;
    const out: Line[] = [];
    for (const p of [...res.conflicts].sort()) out.push({ s: `CONFLICT (content): Merge conflict in ${p}`, c: "danger" });
    out.push({ s: `error: could not revert ${target.slice(0, 7)}... ${msg}`, c: "danger" });
    out.push({ s: 'hint: Resolve the markers, stage with "git add <file>", then "git revert --continue".', c: "dim" });
    out.push({ s: 'You can give up instead with "git revert --abort".', c: "dim" });
    return out;
  }

  private async reverseApply(step: { oid: string; parent: string; msg: string; author: RebaseStep["author"] }): Promise<{ oid?: string; conflicts: Set<string> }> {
    const filesA = new Set(await Git.listFiles({ fs: this.fs!, dir: this.dir, cache: this.cache, ref: step.oid }));
    const filesP = new Set(await Git.listFiles({ fs: this.fs!, dir: this.dir, cache: this.cache, ref: step.parent }));
    const paths = [...new Set([...filesP, ...filesA])].sort();
    const conflicted = new Set<string>();
    for (const path of paths) {
      const inA = filesA.has(path);
      const inP = filesP.has(path);
      const a = inA ? await this.refBlob(step.oid, path) : "";
      const ctxt = inP ? await this.refBlob(step.parent, path) : "";
      const cur = (await this.workExists(path)) ? await this.readWorkFile(path) : "";
      if (inA && inP && a === ctxt) continue;
      if (cur === a) {
        if (!inP) {
          try {
            await Git.remove({ fs: this.fs!, dir: this.dir, cache: this.cache, filepath: path });
          } catch {}
          continue;
        }
        if (cur === ctxt) continue;
        await this.setWorkFile(path, ctxt);
        continue;
      }
      if (cur === ctxt) continue;
      conflicted.add(path);
      const theirs = step.oid.slice(0, 7);
      await this.setWorkFile(path, `<<<<<<< HEAD\n${cur}\n=======\n${ctxt}\n>>>>>>> ${theirs}\n`);
    }
    await Git.add({ fs: this.fs!, dir: this.dir, cache: this.cache, filepath: "." });
    if (conflicted.size) return { conflicts: conflicted };
    const who = await this.configuredAuthor();
    const oid = await Git.commit({
      fs: this.fs!, dir: this.dir, cache: this.cache,
      message: step.msg,
      author: step.author,
      committer: who,
    });
    return { oid, conflicts: new Set() };
  }

  // ---- reflog ----

  private reflogCmd(): Line[] {
    const out: Line[] = [];
    this.reflog.slice(0, 20).forEach((e, i) => {
      const ago = Math.max(0, Math.round((Date.now() - e.when) / 1000));
      const when = ago < 2 ? "just now" : ago < 60 ? `${ago} seconds ago` : ago < 3600 ? `${Math.round(ago / 60)} minutes ago` : `${Math.round(ago / 3600)} hours ago`;
      out.push({ s: `${e.oid} HEAD@{${i}}: ${e.action} (${when})`, c: i === 0 ? "accent" : "plain" });
    });
    return out.length ? out : [{ s: "No reflog entries yet.", c: "dim" }];
  }

  // ---- gc ----

  private async gcCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const refs = [...(await Git.listBranches({ fs: this.fs, dir: this.dir })), ...(await Git.listTags({ fs: this.fs, dir: this.dir }))];
    const commits = new Set<string>();
    const files = new Set<string>();
    for (const r of refs) {
      try {
        const oid = await Git.resolveRef({ fs: this.fs, dir: this.dir, ref: r });
        for (const c of await Git.log({ fs: this.fs, dir: this.dir, ref: oid })) {
          commits.add(c.oid);
        }
        (await Git.listFiles({ fs: this.fs, dir: this.dir, ref: oid })).forEach((f) => files.add(f));
      } catch {}
    }
    const blobCount = Math.max(0, files.size);
    const treeCount = commits.size + blobCount;
    const total = commits.size + treeCount + blobCount || 1;
    const out: Line[] = [
      { s: `Enumerating objects: ${total}, done.`, c: "dim" },
      { s: `Counting objects: 100% (${total}/${total}), done.`, c: "dim" },
      { s: "Delta compression using up to 4 threads", c: "dim" },
      { s: `Compressing objects: 100% (${blobCount}/${total}), done.`, c: "dim" },
      { s: `Writing objects: 100% (${total}/${total}), done.`, c: "dim" },
      { s: `Total ${total} (delta ${blobCount}), reused ${blobCount} (delta 0), pack-reused 0`, c: "dim" },
      { s: "", c: "plain" },
    ];
    if (args.includes("--prune")) out.push({ s: "Expired items in the object database: 0", c: "dim" });
    out.push({ s: "done. Everything is tidy.", c: "ok" });
    return out;
  }

  // ---- blame ----

  private async blameCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const path = args.filter((a) => !a.startsWith("-")).pop();
    if (!path) return [{ s: "usage: git blame <file>", c: "warn" }];
    const content = await this.readWorkFile(path);
    if (!content) return [{ s: `fatal: no such path '${path}'. Did you mean one of the files on the right?`, c: "danger" }];
    const lines = content.endsWith("\n") ? content.slice(0, -1).split("\n") : content.split("\n");
    if (!lines.length) return [{ s: `There are no lines left to blame (${path} is empty).`, c: "dim" }];
    const owners: ({ oid: string; name: string; when: string } | null)[] = lines.map(() => null);
    const present = async (oid: string, p: string) => {
      const s = await this.refBlob(oid, p);
      return new Set(s === "" ? [] : s.split("\n"));
    };
    const hist: { oid: string; name: string; when: string; set: Set<string> }[] = [];
    let curOid = await this.headOid();
    let guard = 0;
    while (guard++ < 200) {
      let commit;
      try {
        commit = await Git.readCommit({ fs: this.fs, dir: this.dir, cache: this.cache, oid: curOid });
      } catch {
        break;
      }
      const name = commit.commit.author.name;
      const when = new Date(commit.commit.author.timestamp * 1000).toISOString().slice(0, 10);
      const hasFile = (await Git.listFiles({ fs: this.fs, dir: this.dir, cache: this.cache, ref: curOid })).includes(path);
      if (hasFile) hist.push({ oid: curOid, name, when, set: await present(curOid, path) });
      else break;
      if (!commit.commit.parent[0]) break;
      curOid = commit.commit.parent[0];
    }
    for (let h = 0; h < hist.length; h++) {
      const entry = hist[h];
      const parentSet = h + 1 < hist.length ? hist[h + 1].set : undefined;
      for (let i = 0; i < lines.length; i++) {
        if (owners[i]) continue;
        if (entry.set.has(lines[i]) && (parentSet === undefined || !parentSet.has(lines[i]))) owners[i] = { oid: entry.oid, name: entry.name, when: entry.when };
      }
      if (owners.every(Boolean)) break;
    }
    const oldest: { oid: string; name: string; when: string } | null = hist[hist.length - 1] ?? null;
    const out: Line[] = [];
    for (let i = 0; i < lines.length; i++) {
      const o = owners[i] ?? oldest;
      const tag = o
        ? `${o.oid.slice(0, 7)} (${o.name} ${o.when}) ${String(i + 1).padStart(4)})`
        : `${"^".padStart(7)} (unknown) ${String(i + 1).padStart(4)})`;
      out.push({ s: `${tag} ${lines[i]}`, c: "plain" });
    }
    return out;
  }

  private async remoteCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const remotes = await Git.listRemotes({ fs: this.fs, dir: this.dir });
    if (!args.length || args[0] === "-v" || args[0] === "--verbose") {
      if (!remotes.length) return [{ s: "No remotes configured. Try: git remote add origin /origin", c: "dim" }];
      if (args.includes("-v") || args.includes("--verbose")) {
        const out: Line[] = [];
        for (const r of remotes) {
          out.push({ s: `${r.remote}\t${r.url} (fetch)`, c: "plain" });
          out.push({ s: `${r.remote}\t${r.url} (push)`, c: "plain" });
        }
        return out;
      }
      return remotes.map((r) => ({ s: r.remote, c: "plain" as Tone }));
    }
    const op = args[0];
    if (op === "add") {
      const remote = args[1];
      const url = args[2];
      if (!remote || !url) return [{ s: "usage: git remote add <name> <url>", c: "warn" }];
      try {
        await Git.addRemote({ fs: this.fs, dir: this.dir, remote, url });
        return [{ s: "", c: "plain" }];
      } catch (err) {
        return [{ s: `error: ${err instanceof Error ? err.message : String(err)}`, c: "danger" }];
      }
    }
    if (op === "rm" || op === "remove") {
      const remote = args[1];
      if (!remote) return [{ s: "usage: git remote rm <name>", c: "warn" }];
      try {
        await Git.deleteRemote({ fs: this.fs, dir: this.dir, remote });
        return [{ s: "", c: "plain" }];
      } catch (err) {
        return [{ s: `error: ${err instanceof Error ? err.message : String(err)}`, c: "danger" }];
      }
    }
    if (op === "get-url") {
      const remote = args[1];
      const found = remotes.find((r) => r.remote === remote);
      return found ? [{ s: found.url, c: "plain" }] : [{ s: `error: No such remote '${remote}'`, c: "danger" }];
    }
    if (op === "set-url") {
      const remote = args[1];
      const url = args[2];
      if (!remote || !url) return [{ s: "usage: git remote set-url <name> <url>", c: "warn" }];
      try {
        await Git.addRemote({ fs: this.fs, dir: this.dir, remote, url, force: true });
        return [{ s: "", c: "plain" }];
      } catch (err) {
        return [{ s: `error: ${err instanceof Error ? err.message : String(err)}`, c: "danger" }];
      }
    }
    return [{ s: `git remote: unknown subcommand '${op}'`, c: "warn" }];
  }

  private async ensureOrigin(): Promise<void> {
    if (!this.fs) return;
    try {
      await Git.listBranches({ fs: this.fs, dir: this.originDir });
    } catch {
      await Git.init({ fs: this.fs, dir: this.originDir, defaultBranch: "main" });
      await Git.branch({ fs: this.fs, dir: this.originDir, ref: "main" });
    }
  }

  private async copyReachable(fromDir: string, toDir: string, seed: string): Promise<{ commits: number; trees: number; blobs: number }> {
    if (!this.fs) return { commits: 0, trees: 0, blobs: 0 };
    const seen = new Set<string>();
    const stack: string[] = [seed];
    const counts = { commits: 0, trees: 0, blobs: 0 };
    while (stack.length) {
      const oid = stack.pop()!;
      if (seen.has(oid)) continue;
      seen.add(oid);
      let o: { type: string; object: unknown };
      try {
        o = await Git.readObject({ fs: this.fs, dir: fromDir, oid, format: "parsed" });
      } catch {
        try {
          const w = await Git.readObject({ fs: this.fs, dir: fromDir, oid, format: "wrapped" });
          await Git.writeObject({ fs: this.fs, dir: toDir, oid, format: "wrapped", type: "blob", object: w.object as Buffer });
          continue;
        } catch {
          continue;
        }
      }
      if (o.type === "blob") {
        counts.blobs++;
        const w = await Git.readObject({ fs: this.fs, dir: fromDir, oid, format: "wrapped" }).catch(() => null);
        if (w) await Git.writeObject({ fs: this.fs, dir: toDir, oid, format: "wrapped", type: "blob", object: w.object as Buffer }).catch(() => {});
        continue;
      }
      if (o.type === "tree") {
        counts.trees++;
        const entries = o.object as { oid: string; type: string; path: string }[];
        for (const e of entries) {
          if (e.type === "tree" || e.type === "blob") stack.push(e.oid);
        }
        const w = await Git.readObject({ fs: this.fs, dir: fromDir, oid, format: "wrapped" }).catch(() => null);
        if (w) await Git.writeObject({ fs: this.fs, dir: toDir, oid, format: "wrapped", type: "tree", object: w.object as Buffer }).catch(() => {});
        continue;
      }
      if (o.type === "commit") {
        counts.commits++;
        const commit = o.object as { tree: string; parent: string[] };
        stack.push(commit.tree);
        for (const p of commit.parent ?? []) stack.push(p);
        const w = await Git.readObject({ fs: this.fs, dir: fromDir, oid, format: "wrapped" }).catch(() => null);
        if (w) await Git.writeObject({ fs: this.fs, dir: toDir, oid, format: "wrapped", type: "commit", object: w.object as Buffer }).catch(() => {});
        continue;
      }
    }
    return counts;
  }

  private async remoteUrl(name: string): Promise<string | null> {
    if (!this.fs) return null;
    const remotes = await Git.listRemotes({ fs: this.fs, dir: this.dir });
    const found = remotes.find((r) => r.remote === name);
    if (!found) {
      return null;
    }
    return found.url;
  }

  private async fetchCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const remote = args[0] || "origin";
    const url = await this.remoteUrl(remote);
    if (!url || url !== this.originDir) {
      return [{ s: `fatal: '${remote}' does not appear to be a git repository — sandbox remotes live at /origin`, c: "danger" }];
    }
    await this.ensureOrigin();
    const out: Line[] = [];
    for (const branch of await Git.listBranches({ fs: this.fs, dir: this.originDir })) {
      let oid: string;
      try {
        oid = await Git.resolveRef({ fs: this.fs, dir: this.originDir, ref: `refs/heads/${branch}` });
      } catch {
        continue;
      }
      await this.copyReachable(this.originDir, this.dir, oid);
      await Git.writeRef({ fs: this.fs, dir: this.dir, ref: `refs/remotes/${remote}/${branch}`, value: oid });
      out.push({ s: `From ${url}`, c: "dim" });
      out.push({ s: ` * branch            ${branch}     -> FETCH_HEAD`, c: "plain" });
      out.push({ s: `   ${url}            -> ${remote}/${branch}`, c: "dim" });
    }
    return out.length ? out : [{ s: `From ${url}`, c: "dim" }, { s: " * [new branch]      main     -> origin/main", c: "plain" }];
  }

  private async pushCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const setUpstream = args.includes("-u") || args.includes("--set-upstream");
    const remote = (args.find((a) => !a.startsWith("-") && a !== "push") ?? "origin").trim();
    const branch = args[args.length - 1] && !args[args.length - 1].startsWith("-") && args[args.length - 1] !== remote ? args[args.length - 1] : (await this.currentBranchName());
    const url = await this.remoteUrl(remote);
    if (!url || url !== this.originDir) {
      return [{ s: `fatal: '${remote}' does not appear to be a git repository — configure it with: git remote add origin /origin`, c: "danger" }];
    }
    await this.ensureOrigin();
    let oid: string;
    try {
      oid = await Git.resolveRef({ fs: this.fs, dir: this.dir, ref: `refs/heads/${branch}` });
    } catch {
      return [{ s: `fatal: src refspec ${branch} does not match any`, c: "danger" }];
    }
    const remoteOld = await Git.resolveRef({ fs: this.fs, dir: this.originDir, ref: `refs/heads/${branch}` }).catch(() => "");
    await this.copyReachable(this.dir, this.originDir, oid);
    await Git.writeRef({ fs: this.fs, dir: this.originDir, ref: `refs/heads/${branch}`, value: oid });
    if (setUpstream) {
      await Git.setConfig({ fs: this.fs, dir: this.dir, path: `branch.${branch}.remote`, value: remote });
      await Git.setConfig({ fs: this.fs, dir: this.dir, path: `branch.${branch}.merge`, value: `refs/heads/${branch}` });
    }
    if (remoteOld === oid) return [{ s: "Everything up-to-date", c: "dim" }];
    const out: Line[] = [{ s: `To ${url}`, c: "dim" }];
    out.push({
      s: remoteOld ? `   ${remoteOld.slice(0, 7)}..${oid.slice(0, 7)}  ${branch} -> ${branch}` : ` * [new branch]      ${branch} -> ${branch}`,
      c: "ok",
    });
    return out;
  }

  private async pullCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const remote = args[0] || "origin";
    const branch = args[1] || (await this.currentBranchName());
    const url = await this.remoteUrl(remote);
    if (!url || url !== this.originDir) {
      return [{ s: `fatal: '${remote}' does not appear to be a git repository — configure it with: git remote add origin /origin`, c: "danger" }];
    }
    await this.ensureOrigin();
    let theirs: string;
    try {
      theirs = await Git.resolveRef({ fs: this.fs, dir: this.originDir, ref: `refs/heads/${branch}` });
    } catch {
      return [{ s: `fatal: couldn't find remote ref ${branch}`, c: "danger" }];
    }
    const ours = await this.headOid();
    if (ours === theirs) return [{ s: "Already up to date.", c: "dim" }];
    await this.copyReachable(this.originDir, this.dir, theirs);
    await Git.writeRef({ fs: this.fs, dir: this.dir, ref: `refs/remotes/${remote}/${branch}`, value: theirs });
    if (await this.hasDirty()) return [{ s: "error: Your local changes would be overwritten by pull — commit or stash first.", c: "danger" }];
    try {
      await Git.merge({ fs: this.fs, dir: this.dir, cache: this.cache, ours: branch, theirs, message: `Merge remote-tracking branch '${remote}/${branch}'`, fastForwardOnly: true });
      await Git.checkout({ fs: this.fs, dir: this.dir, ref: theirs, force: true });
      this.refentry(`pull ${remote} ${branch}: Fast-forward`);
      return [
        { s: `Updating ${ours.slice(0, 7)}..${theirs.slice(0, 7)}`, c: "ok" },
        { s: "Fast-forward", c: "dim" },
      ];
    } catch {
      const base = await Git.findMergeBase({ fs: this.fs, dir: this.dir, cache: this.cache, oids: [ours, theirs] });
      if (!base.length) return [{ s: "fatal: refusing to merge unrelated histories", c: "danger" }];
      try {
        await Git.merge({ fs: this.fs, dir: this.dir, cache: this.cache, ours: branch, theirs, message: `Merge remote-tracking branch '${remote}/${branch}'`, abortOnConflict: false });
        this.refentry(`pull ${remote} ${branch}: merge`);
        return [{ s: `Merge made by the 'ort' strategy.`, c: "ok" }];
      } catch (err) {
        if (this.catchConflictError(err)) {
          await this.refreshConflicts();
          this.mergeState = { oursId: ours, theirsId: theirs, branch };
          const out: Line[] = [];
          for (const p of [...this.conflicts].sort()) out.push({ s: `CONFLICT (content): Merge conflict in ${p}`, c: "danger" });
          out.push({ s: "Automatic merge failed; fix conflicts and then:", c: "plain" });
          out.push({ s: "  1. click the file in the editor (right)", c: "accent" });
          out.push({ s: "  2. remove the <<<<<<< / ======= / >>>>>>> markers and keep both sides", c: "accent" });
          out.push({ s: '  3.  git add <file>    4.  git merge --continue', c: "accent" });
          return out;
        }
        return [{ s: `error: pull failed — ${err instanceof Error ? err.message : String(err)}`, c: "danger" }];
      }
    }
  }

  private async cloneCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const url = args[0];
    if (!url || url !== this.originDir) return [{ s: "usage: git clone /origin <name>   (sandbox remote lives at /origin)", c: "warn" }];
    const dest = (args[1] || "origin").replace(/^\/+/, "");
    if (!dest || /[^A-Za-z0-9._-]/.test(dest)) return [{ s: `fatal: invalid repository name '${dest}'`, c: "danger" }];
    await this.ensureOrigin();
    let oid: string;
    try {
      oid = await Git.resolveRef({ fs: this.fs, dir: this.originDir, ref: "refs/heads/main" });
    } catch {
      return [{ s: `fatal: repository '${url}' does not have a main branch yet`, c: "danger" }];
    }
    const toDir = `/clones/${dest}`;
    try {
      await Git.init({ fs: this.fs, dir: toDir, defaultBranch: "main" });
    } catch {
      return [{ s: `fatal: destination path '${dest}' already exists`, c: "danger" }];
    }
    const counts = await this.copyReachable(this.originDir, toDir, oid);
    await Git.writeRef({ fs: this.fs, dir: toDir, ref: "refs/heads/main", value: oid });
    await Git.checkout({ fs: this.fs, dir: toDir, ref: "main" });
    await Git.addRemote({
      fs: this.fs,
      dir: toDir,
      remote: "origin",
      url,
      force: true,
    });
    const out: Line[] = [
      { s: `Cloning into '${dest}'...`, c: "dim" },
      { s: `remote: Enumerating objects: ${counts.commits + counts.trees + counts.blobs}, done.`, c: "dim" },
      { s: `remote: Counting objects: 100% (${counts.commits + counts.trees + counts.blobs}/${counts.commits + counts.trees + counts.blobs}), done.`, c: "dim" },
      { s: `remote: Compressing objects: 100% (${Math.max(1, counts.blobs)}/${counts.commits + counts.trees + counts.blobs}), done.`, c: "dim" },
      { s: `remote: Total ${counts.commits + counts.trees + counts.blobs} (delta 0), reused 0 (delta 0), pack-reused 0`, c: "dim" },
      { s: `Receiving objects: 100% (${counts.commits + counts.trees + counts.blobs}/${counts.commits + counts.trees + counts.blobs}), done.`, c: "dim" },
      { s: "", c: "plain" },
      { s: `Resolving deltas: 100% (0/0), done.`, c: "dim" },
      { s: "", c: "plain" },
      { s: `The clone lives at /clones/${dest} — in this sandbox you keep working here. To try it, reset on the practice button.`, c: "warn" },
    ];
    return out;
  }

  private async reset(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    if (args[0] !== "--hard") return [{ s: "Practice engine supports: git reset --hard <ref>", c: "warn" }];
    const ref = args[1];
    if (!ref) return [{ s: "usage: git reset --hard <HEAD~n | branch | hash>", c: "warn" }];
    const id = await this.refId(ref);
    if (!id) return [{ s: `fatal: ambiguous argument '${ref}'`, c: "danger" }];
    this.conflicts.clear();
    this.mergeState = null;
    this.cherryState = null;
    this.revertState = null;
    this.rebaseState = null;
    try {
      await Git.checkout({ fs: this.fs, cache: this.cache, dir: this.dir, ref: id, force: true });
      for (const f of await Git.listFiles({ fs: this.fs, cache: this.cache, dir: this.dir, ref: id })) {
        try {
          await Git.resetIndex({ fs: this.fs, cache: this.cache, dir: this.dir, filepath: f });
        } catch {}
      }
      const c = await Git.readCommit({ fs: this.fs, cache: this.cache, dir: this.dir, oid: id });
      this.refentry(`reset: moving to ${ref}`);
      return [{ s: `HEAD is now at ${id.slice(0, 7)} ${c.commit.message.split("\n")[0]}`, c: "ok" }];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `fatal: ${msg}`, c: "danger" }];
    }
  }

  private async stashCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const rawOp = args[0] ?? "push";
    if (!["push", "list", "pop", "apply", "drop", "clear"].includes(rawOp)) {
      return [{ s: "usage: git stash push | list | pop | apply | drop | clear", c: "warn" }];
    }
    const op = rawOp as StashOp;
    if (op === "push") {
      if (!(await this.hasDirty())) return [{ s: "No local changes to save", c: "dim" }];
      if (this.mergeState) return [{ s: "error: cannot stash while a merge is in progress", c: "danger" }];
      await Git.stash({ fs: this.fs, dir: this.dir, op: "push" });
      return [{ s: `Saved working directory and index state WIP on ${await this.currentBranchName()}`, c: "ok" }];
    }
    if (op === "list") {
      const raw = (await Git.stash({ fs: this.fs, dir: this.dir, op: "list" })) ?? "";
      const list = raw.split("\n").filter(Boolean);
      return list.length
        ? list.map((l) => ({ s: l, c: "plain" as Tone }))
        : [{ s: "No stash entries.", c: "dim" }];
    }
    try {
      await Git.stash({ fs: this.fs, dir: this.dir, op, refIdx: 0 });
      this.conflicts.clear();
      this.refentry(`stash ${op}: stash@{0}`);
      return [{ s: op === "pop" ? "Dropped the stash entry from refs/stash." : `Applied stash@{0}`, c: "ok" }];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return [{ s: `error: ${msg}`, c: "danger" }];
    }
  }

  private async diffCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const cached = args.includes("--cached") || args.includes("--staged");
    const given = args.filter((a) => !a.startsWith("-"));
    const matrix = await this.statusMatrix();
    const out: Line[] = [];
    for (const [path] of matrix) {
      if (given.length && !given.includes(path)) continue;
      let state: FileState;
      try {
        state = this.classify(matrix.find((m) => m[0] === path)![1], matrix.find((m) => m[0] === path)![2], matrix.find((m) => m[0] === path)![3], path);
      } catch {
        continue;
      }
      const target = cached ? ["staged", "unchanged"] : ["modified", "deleted", "new"];
      if (!target.includes(state)) continue;
      const base = await this.headBlob(path);
      const cur = await this.readWorkFile(path);
      if (state === "new" && !cached) continue;
      const show = cached ? state === "staged" : state === "new" ? false : state === "modified" || state === "deleted";
      if (!show) continue;
      if ((base ?? "") === (cur ?? "")) continue;
      out.push(...this.formatDiff(path, base, cur));
    }
    if (!out.length) {
      out.push({ s: cached ? "no staged changes" : "no changes (to update what will be committed)\n  (use \"git add <file>...\" to update what will be committed)", c: "dim" });
    }
    return out;
  }

  private formatDiff(path: string, a: string, b: string): Line[] {
    const d = diffText(a, b);
    const aLines = a === "" ? 0 : a.split("\n").length;
    const bLines = b === "" ? 0 : b.split("\n").length;
    const out: Line[] = [
      { s: `diff --git a/${path} b/${path}`, c: "dim" },
      { s: `index xxxxxx..yyyyyy 100644`, c: "dim" },
      { s: `--- a/${path}`, c: "dim" },
      { s: `+++ b/${path}`, c: "dim" },
      { s: `@@ -${aLines} +${bLines} @@`, c: "accent" },
    ];
    for (const l of d.lines) {
      out.push({ s: `${l.t === "add" ? "+" : "-"}${l.s}`, c: l.t === "add" ? ("ok" as Tone) : ("danger" as Tone) });
    }
    return out;
  }

  private async showCmd(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const rev = args.find((a) => !a.startsWith("-")) ?? "HEAD";
    const colon = rev.split(":");
    if (colon.length === 2) {
      const id = await this.refId(colon[0]);
      if (!id) return [{ s: `fatal: ambiguous argument '${rev}'`, c: "danger" }];
      let content = "";
      try {
        const { blob } = await Git.readBlob({ fs: this.fs, cache: this.cache, dir: this.dir, oid: id, filepath: colon[1] });
        content = Buffer.from(blob).toString("utf8");
      } catch {
        return [{ s: `fatal: path '${colon[1]}' does not exist in '${colon[0]}'`, c: "danger" }];
      }
      return content.split("\n").map((l) => ({ s: l, c: "plain" as Tone }));
    }
    const id = await this.refId(rev);
    if (!id) return [{ s: `fatal: ambiguous argument '${rev}': unknown revision or path not in the working tree.`, c: "danger" }];
    let c;
    try {
      c = await Git.readCommit({ fs: this.fs, cache: this.cache, dir: this.dir, oid: id });
    } catch {
      return [{ s: `fatal: bad object ${rev}`, c: "danger" }];
    }
    const chips = await this.chips(id);
    const parent = c.commit.parent[0];
    const out: Line[] = [
      { s: `commit ${id}${chips}`, c: "accent" },
      { s: `Author: ${c.commit.author.name} <${c.commit.author.email}>`, c: "dim" },
      { s: `Date:   ${new Date(c.commit.author.timestamp * 1000).toUTCString().replace("GMT", "+0000")}`, c: "dim" },
      { s: "", c: "plain" },
      { s: `    ${c.commit.message}`, c: "plain" },
    ];
    let addCount = 0;
    let delCount = 0;
    const changed: string[] = [];
    const all = new Set<string>();
    if (parent) {
      for (const f of await Git.listFiles({ fs: this.fs, cache: this.cache, dir: this.dir, ref: parent })) all.add(f);
    }
    for (const f of await Git.listFiles({ fs: this.fs, cache: this.cache, dir: this.dir, ref: id })) all.add(f);
    for (const p of all) {
      let a = "";
      let b = "";
      if (parent) {
        try {
          const r = await Git.readBlob({ fs: this.fs, cache: this.cache, dir: this.dir, oid: parent, filepath: p });
          a = Buffer.from(r.blob).toString("utf8");
        } catch {}
      }
      try {
        const r = await Git.readBlob({ fs: this.fs, cache: this.cache, dir: this.dir, oid: id, filepath: p });
        b = Buffer.from(r.blob).toString("utf8");
      } catch {}
      if (a === b) continue;
      changed.push(p);
      const d = diffText(a, b);
      addCount += d.added;
      delCount += d.removed;
      out.push(...this.formatDiff(p, a, b));
    }
    out.push({ s: ` ${changed.length || 0} file${changed.length === 1 ? "" : "s"} changed, ${addCount} insertions(+), ${delCount} deletions(-)`, c: "dim" });
    return out;
  }

  private async catFile(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const mode = args[0];
    const addr = args[1];
    if ((mode !== "-t" && mode !== "-p") || !addr) return [{ s: "usage: git cat-file (-t | -p) <rev>  e.g. HEAD, HEAD:README.md", c: "warn" }];
    const colon = addr.split(":");
    if (colon.length === 2) {
      const id = await this.refId(colon[0]);
      let content = "";
      try {
        const { blob } = await Git.readBlob({ fs: this.fs, cache: this.cache, dir: this.dir, oid: id, filepath: colon[1] });
        content = Buffer.from(blob).toString("utf8");
      } catch {
        return [{ s: `fatal: Not a valid object name '${addr}'`, c: "danger" }];
      }
      if (mode === "-t") return [{ s: "blob", c: "accent" }];
      return content.split("\n").map((l) => ({ s: l, c: "plain" as Tone }));
    }
    const id = await this.refId(addr);
    if (!id) return [{ s: `fatal: Not a valid object name '${addr}'`, c: "danger" }];
    try {
      const c = await Git.readCommit({ fs: this.fs, cache: this.cache, dir: this.dir, oid: id });
      if (mode === "-t") return [{ s: "commit", c: "accent" }];
      const t = Math.floor(c.commit.author.timestamp);
      return [
        { s: `tree ${c.commit.tree}`, c: "dim" },
        ...c.commit.parent.map((pa) => ({ s: `parent ${pa}`, c: "dim" } as Line)),
        { s: `author ${c.commit.author.name} <${c.commit.author.email}> ${t} +0000`, c: "plain" },
        { s: `committer ${c.commit.committer.name} <${c.commit.committer.email}> ${t} +0000`, c: "plain" },
        { s: "", c: "plain" },
        { s: `    ${c.commit.message}`, c: "plain" },
      ];
    } catch {
      return [{ s: `fatal: Not a valid object name '${addr}'`, c: "danger" }];
    }
  }

  private async rm(args: string[]): Promise<Line[]> {
    if (!this.fs) return [];
    const given = args.filter((a) => !a.startsWith("-"));
    const out: Line[] = [];
    const existing = new Set((await this.listWorkFiles()).map((f) => f.path));
    for (const p of given) {
      if (!existing.has(p)) {
        out.push({ s: `fatal: pathspec '${p}' did not match any files`, c: "danger" });
        continue;
      }
      if (this.conflicts.has(p)) {
        out.push({ s: `error: '${p}' is part of an unresolved merge — resolve it first`, c: "danger" });
        continue;
      }
      try {
        await Git.remove({ fs: this.fs, cache: this.cache, dir: this.dir, filepath: p });
        await this.fs.promises.unlink(`${this.dir}/${p}`);
        out.push({ s: `rm '${p}'`, c: "ok" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        out.push({ s: `error: ${msg}`, c: "danger" });
      }
    }
    if (!out.length) out.push({ s: "nothing to remove", c: "dim" });
    return out;
  }

  private async cat(args: string[]): Promise<Line[]> {
    const p = args[0];
    if (!p) return [{ s: "usage: cat <file>", c: "warn" }];
    const content = await this.readWorkFile(p);
    if (content === "" && !(await this.listWorkFiles()).some((f) => f.path === p)) {
      return [{ s: `cat: ${p}: No such file`, c: "danger" }];
    }
    return (content || "").split("\n").map((l) => ({
      s: l,
      c: l.startsWith("<<<<<<< ") ? ("danger" as Tone) : l === "=======" ? ("accent" as Tone) : l.startsWith(">>>>>>> ") ? ("danger" as Tone) : ("plain" as Tone),
    }));
  }

  private async ls(): Promise<Line[]> {
    const files = await this.listWorkFiles();
    const out: Line[] = [];
    for (const f of files) {
      out.push({
        s: `  ${f.path}${f.conflict ? "  <-- conflict" : ""}`,
        c: f.conflict ? ("danger" as Tone) : "plain",
      });
    }
    if (!out.length) out.push({ s: "empty working tree", c: "dim" });
    return out;
  }
}

export function createPractice(seed: Seed = "starter"): GitEngine {
  return new GitEngine(seed);
}