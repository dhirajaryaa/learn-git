"use client";

import { motion } from "motion/react";
import { IconTerminal2, IconCheck, IconAlertTriangle } from "@tabler/icons-react";

const OURS = ['export function Header() {', '  return <div className="dark">', '    fallback header', '  </div>;', '}'];
const THEIRS = ['export function Header() {', '  return <div className="bg-black">', '    avatar header', '  </div>;', '}'];
const RESOLVED = ['export function Header() {', '  const theme = useTheme();', '  return <div className={theme.dark}>', '    avatar header', '  </div>;', '}'];

function Row({ children, delay, cls }: { children: React.ReactNode; delay: number; cls?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`whitespace-pre px-5 py-[3px] font-mono text-[11px] leading-relaxed ${cls ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

export function Conflict({ mode, caption }: { mode: "markers" | "resolved"; caption?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-xl border border-line bg-[#0c0c0d] shadow-sm">
        {/* window chrome */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c92e]" />
          <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
            <IconTerminal2 size={12} /> src/Header.tsx
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            {mode === "markers" ? (
              <span className="flex items-center gap-1 rounded-full border border-[#f97316]/40 bg-[#f97316]/15 px-2.5 py-1 text-[10px] font-semibold text-[#fb923c]">
                <IconAlertTriangle size={11} /> unmerged
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/15 px-2.5 py-1 text-[10px] font-semibold text-[#4ade80]">
                <IconCheck size={11} /> resolved
              </span>
            )}
          </span>
        </div>

        {/* branch chips */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-2.5">
          {mode === "markers" ? (
            <>
              <span className="rounded-md bg-[#ef4444]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#f87171]">
                HEAD ▸ main
              </span>
              <span className="text-[13px] text-zinc-600">⇄</span>
              <span className="rounded-md bg-[#22c55e]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#4ade80]">
                feature ▸ avatar
              </span>
            </>
          ) : (
            <span className="rounded-md bg-[#22c55e]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#4ade80]">
              main ⇄ feature — merged
            </span>
          )}
        </div>

        {/* the file */}
        <div className="flex flex-col py-2.5">
          {mode === "markers" ? (
            <>
              <Row delay={0.15} cls="bg-[#7f1d1d]/40 text-[#fca5a5] border-l-2 border-l-[#ef4444]">
                {"<<<<<<< HEAD"}
              </Row>
              {OURS.map((l, i) => (
                <Row key={l} delay={0.28 + i * 0.18} cls="text-[#fecaca]">
                  {l}
                </Row>
              ))}
              <Row delay={1} cls="bg-white/5 text-[#fb923c] border-l-2 border-l-[#f97316]">
                {"======="}
              </Row>
              {THEIRS.map((l, i) => (
                <Row key={l} delay={1.1 + i * 0.18} cls="text-[#bbf7d0]">
                  {l}
                </Row>
              ))}
              <Row delay={1.8} cls="bg-[#14532d]/40 text-[#86efac] border-l-2 border-l-[#22c55e]">
                {">>>>>>> feature ▸ avatar"}
              </Row>
            </>
          ) : (
            RESOLVED.map((l, i) => (
              <Row
                key={l}
                delay={0.25 + i * 0.2}
                cls={`${i === 1 || i === 3 ? "text-[#bbf7d0]" : "text-zinc-200"}`}
              >
                {l}
              </Row>
            ))
          )}
        </div>
      </div>
      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}