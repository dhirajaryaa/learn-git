"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconFile,
  IconFileAlert,
  IconMaximize,
  IconMinimize,
  IconPlayerPlay,
  IconRotate,
  IconX,
} from "@tabler/icons-react";
import {
  GitEngine,
  type DiffResult,
  type FileState,
  type Line,
  type Seed,
  type Tone,
} from "@/lib/git";
import { useI18n } from "@/components/i18n/LanguageProvider";

const TONE_CLS: Record<Tone, string> = {
  plain: "text-zinc-300",
  dim: "text-zinc-500",
  accent: "text-[#e879f9]",
  ok: "text-[#4ade80]",
  warn: "text-[#fb923c]",
  danger: "text-[#f87171]",
};

const STATE_CLS: Record<FileState, string> = {
  conflict: "border-[#f97316]/45 bg-[#f97316]/15 text-[#fb923c]",
  staged: "border-[#22c55e]/45 bg-[#22c55e]/15 text-[#4ade80]",
  new: "border-[#60a5fa]/45 bg-[#60a5fa]/15 text-[#60a5fa]",
  modified: "border-[#eab308]/45 bg-[#eab308]/15 text-[#eab308]",
  deleted: "border-[#f87171]/45 bg-[#f87171]/15 text-[#f87171]",
  unchanged: "hidden",
};

export function PracticeTerminal({
  seed = "starter",
  suggestions = [],
  onReset,
}: {
  seed?: Seed;
  suggestions?: string[];
  onReset?: () => void;
}) {
  const { ui } = useI18n();
  const [engine] = useState(() => new GitEngine(seed));
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [fs, setFs] = useState<{ path: string; state: FileState }[]>([]);
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const [cmd, setCmd] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [rev, setRev] = useState(0);
  const [editorFull, setEditorFull] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const flashTimer = useRef<number | null>(null);

  const scrollDown = () => {
    requestAnimationFrame(() => {
      if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
    });
  };

  const refresh = async (prev?: Map<string, FileState>) => {
    const next = await engine.fileStates();
    if (prev) {
      const flipped = new Set<string>();
      for (const st of next) if (prev.get(st.path) !== st.state) flipped.add(st.path);
      if (flipped.size) {
        setFlash(flipped);
        if (flashTimer.current) window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setFlash(new Set()), 1000);
      }
    }
    setFs(next);
    setLines(engine.snapshotLines());
    scrollDown();
  };

  useEffect(() => {
    let alive = true;
    engine
      .boot()
      .then(async () => {
        if (!alive) return;
        setReady(true);
        await refresh();
      })
      .catch((err) => {
        if (!alive) return;
        setBootError(err instanceof Error ? err.message : String(err));
        setReady(true);
        setLines([
          { s: "Could not start the git engine in this browser.", c: "danger" },
          { s: `Reason: ${err instanceof Error ? err.message : String(err)}`, c: "dim" },
          { s: "This browser blocked the local storage the sandbox needs \u2014 enable site data and reload.", c: "dim" },
        ]);
      });
    return () => {
      alive = false;
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
    // boot once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine]);

  useEffect(() => {
    if (!editorFull) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditorFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editorFull]);

  useEffect(() => {
    if (activeFile && editorFull) textareaRef.current?.focus();
  }, [activeFile, editorFull]);

  const runCmd = async (raw: string) => {
    if (!ready) return;
    const trimmed = raw.trim().slice(0, 2000);
    if (!trimmed) return;
    const prev = new Map((await engine.fileStates()).map((s) => [s.path, s.state]));
    try {
      await engine.run(trimmed);
    } catch (err) {
      engine.pushLine({ s: `internal: ${err instanceof Error ? err.message : String(err)}`, c: "danger" });
    }
    setHist((h) => [...h, trimmed]);
    setHistIdx(-1);
    setCmd("");
    setRev((r) => r + 1);
    await refresh(prev);
  };

  const openFile = async (path: string) => {
    const content = await engine.readWorkFile(path);
    const conflicted = engine.conflictPaths.has(path);
    setActiveFile(path);
    setDraft(content);
    setShowDiff(conflicted);
  };

  const saveFile = async () => {
    if (!activeFile) return;
    await engine.setWorkFile(activeFile, draft);
    setActiveFile(null);
    setRev((r) => r + 1);
    await refresh();
  };

  const reset = () => {
    if (typeof window !== "undefined" && !window.confirm(ui.practice.resetConfirm)) return;
    onReset?.();
  };

  useEffect(() => {
    if (!activeFile) return;
    let alive = true;
    engine.diffDraft(activeFile, draft).then((d) => {
      if (alive) setDiff(d);
    });
    return () => {
      alive = false;
    };
  }, [activeFile, draft, rev, engine]);

  const bootErrorLines: Line[] = bootError
    ? [
        { s: "Could not start the git engine in this browser.", c: "danger" },
        { s: `Reason: ${bootError}`, c: "dim" },
        { s: "This browser blocked the local storage the sandbox needs \u2014 enable site data and reload.", c: "dim" },
      ]
    : [];
  const renderedLines = lines.length ? lines : bootErrorLines;

  const fileList = (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-1 p-2">
        {fs.map((f) => {
          const flashing = flash.has(f.path);
          return (
            <button
              key={f.path}
              onClick={() => void openFile(f.path)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left font-mono text-[11px] text-zinc-300 transition-colors hover:bg-white/10 ${
                flashing ? "border-accent/60 bg-accent/10" : "border-transparent hover:border-white/10"
              }`}
            >
              {f.state === "conflict" ? (
                <IconFileAlert size={13} className="shrink-0 text-[#fb923c]" />
              ) : (
                <IconFile size={13} className="shrink-0 text-zinc-500" />
              )}
              <span className="truncate flex-1">{f.path}</span>
              {f.state !== "unchanged" && (
                <span
                  className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${STATE_CLS[f.state]}`}
                >
                  {f.state === "conflict"
                    ? ui.practice.statusConflict
                    : f.state === "staged"
                      ? ui.practice.statusStaged
                      : f.state === "new"
                        ? ui.practice.statusNew
                        : f.state === "deleted"
                          ? ui.practice.statusDeleted
                          : ui.practice.statusModified}
                </span>
              )}
            </button>
          );
        })}
        {ready && !bootError && fs.length === 0 && (
          <p className="px-2.5 pt-2 text-[10.5px] text-zinc-500">Working tree is clean.</p>
        )}
        {ready && (
          <p className="px-2.5 pt-2 text-[10.5px] leading-relaxed text-zinc-500">
            Click a file to edit it, save, then stage with{" "}
            <span className="text-zinc-300">git add</span>.
          </p>
        )}
      </div>
    </div>
  );

  const editor = activeFile ? (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <p className="truncate flex-1 font-mono text-[10.5px] text-zinc-400">{activeFile}</p>
        {diff && (
          <button
            onClick={() => setShowDiff((v) => !v)}
            className={`truncate rounded-md border px-2 py-1 text-[9.5px] font-semibold transition-colors ${
              showDiff
                ? "border-accent/50 bg-accent/15 text-accent"
                : "border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {diff.same
              ? "unchanged"
              : `${ui.practice.added.replace("{n}", String(diff.added))} · ${ui.practice.removed.replace("{n}", String(diff.removed))}`}
          </button>
        )}
        <button
          onClick={() => setEditorFull((v) => !v)}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={editorFull ? ui.practice.closeEditor : ui.practice.fullEditor}
        >
          {editorFull ? <IconMinimize size={13} /> : <IconMaximize size={13} />}
        </button>
      </div>

      {showDiff && diff && (
        <div className="max-h-40 overflow-y-auto border-b border-white/10 bg-black/40 px-3 py-2 font-mono text-[10.5px] leading-relaxed">
          <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-widest text-zinc-500">
            {ui.practice.diff}
          </p>
          {diff.same ? (
            <p className="text-zinc-500">—</p>
          ) : (
            diff.lines.map((l, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap ${l.t === "add" ? "text-[#4ade80]" : "text-[#f87171]"}`}
              >
                {l.t === "add" ? "+ " : "- "}
                {l.s || " "}
              </div>
            ))
          )}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, 50000))}
        spellCheck={false}
        maxLength={50000}
        className="min-h-[200px] flex-1 resize-none overflow-auto bg-black/30 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-zinc-200 outline-none selection:bg-accent/30"
      />
      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2.5">
        <button
          onClick={() => void saveFile()}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-[11.5px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {ui.practice.save}
        </button>
        <button
          onClick={() => setActiveFile(null)}
          className="rounded-lg border border-white/10 px-3.5 py-1.5 text-[11.5px] font-medium text-zinc-400 hover:bg-white/10"
        >
          {ui.practice.cancel}
        </button>
        {editorFull && (
          <span className="ml-auto hidden text-[9.5px] uppercase tracking-widest text-zinc-600 sm:inline">
            esc {ui.practice.closeEditor.toLowerCase()}
          </span>
        )}
      </div>
    </div>
  ) : (
    fileList
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#0c0c0d] shadow-sm">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c92e]" />
        <span className="ml-3 font-mono text-[11px] text-zinc-400">git-in-depth · practice</span>
        <span className="ml-auto flex items-center gap-2">
          <button
            onClick={reset}
            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={ui.practice.reset}
          >
            <IconRotate size={13} />
          </button>
        </span>
      </div>

      <div
        className={`grid md:grid-cols-[1fr_minmax(0,320px)] ${
          editorFull ? "h-[78vh] min-h-[480px] md:grid-cols-1" : ""
        }`}
      >
        {/* terminal */}
        <div
          className={`flex flex-col border-b border-white/10 md:border-b-0 md:border-r ${
            editorFull ? "hidden" : "h-[520px]"
          }`}
        >
          <div
            ref={scroller}
            className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-relaxed"
          >
            {!ready && (
              <p className="text-[11.5px] text-zinc-500">
                {ui.practice.booting}
                <span className="ml-0.5 animate-pulse">▍</span>
              </p>
            )}
            {renderedLines.map((l, i) => (
              <div key={i} className={`whitespace-pre-wrap ${TONE_CLS[l.c ?? "plain"]}`}>
                {l.s || "\u00a0"}
              </div>
            ))}
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 px-3 py-2">
              <span className="text-[9.5px] font-semibold uppercase tracking-widest text-zinc-500">
                {ui.practice.suggested}
              </span>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCmd(s)}
                  className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-300 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runCmd(cmd);
            }}
            className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5"
          >
            <span className="shrink-0 font-mono text-[12px] font-semibold text-[#4ade80]">❯</span>
            <input
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (hist.length) {
                    const ni = histIdx === -1 ? hist.length - 1 : Math.max(0, histIdx - 1);
                    setHistIdx(ni);
                    setCmd(hist[ni]);
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (histIdx === -1) return;
                  const ni = histIdx + 1;
                  if (ni >= hist.length) {
                    setHistIdx(-1);
                    setCmd("");
                  } else {
                    setHistIdx(ni);
                    setCmd(hist[ni]);
                  }
                }
              }}
              placeholder={ui.practice.hint}
              autoComplete="off"
              spellCheck={false}
              autoFocus
              maxLength={2000}
              aria-label={ui.practice.hint}
              className="w-full bg-transparent font-mono text-[12px] text-zinc-200 placeholder-zinc-600 outline-none"
            />
            <button
              type="submit"
              disabled={!ready}
              aria-label={ui.practice.run}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-accent/40 bg-accent/10 text-accent transition-colors hover:bg-accent/20 disabled:opacity-40"
            >
              <IconPlayerPlay size={12} />
            </button>
          </form>
        </div>

        {/* file editor */}
        <div className={`flex flex-col bg-white/5 ${editorFull ? "" : "h-[520px]"}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {ui.practice.files}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditorFull((v) => !v)}
                className="grid h-6 w-6 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={editorFull ? ui.practice.closeEditor : ui.practice.fullEditor}
              >
                {editorFull ? <IconMinimize size={13} /> : <IconMaximize size={13} />}
              </button>
              {activeFile && (
                <button
                  onClick={() => setActiveFile(null)}
                  className="grid h-6 w-6 place-items-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white"
                  aria-label={ui.practice.cancel}
                >
                  <IconX size={12} />
                </button>
              )}
            </div>
          </div>
          {editor}
        </div>
      </div>
    </div>
  );
}