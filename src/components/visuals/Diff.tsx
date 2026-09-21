"use client";

import { motion } from "motion/react";
import { IconCircleMinus, IconCirclePlus } from "@tabler/icons-react";

const OLD = ["const header = 'OLD'", "const nav = [ 'home', 'about' ]", "return <div>"];
const NEW = ["const header = 'NEW'", "const nav = [ 'home', 'about', 'blog' ]", "return <div>"];
const CHANGED = [true, true, false];

export function Diff({ caption }: { caption?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-xl border border-line bg-[#fafafb]">
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-2 dark:bg-zinc-900">
          <span className="font-mono text-[11px] font-semibold text-zinc-500">
            @@ -1,3 +1,3 @@ src/App.tsx
          </span>
          <span className="text-[10px] font-medium text-zinc-400">Myers diff → edit script</span>
        </div>

        <div className="flex flex-col">
          {OLD.map((line, i) => (
            <div key={i} className="grid grid-cols-2">
              {/* old panel */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.24 }}
                className={`flex items-center gap-2 border-r border-line px-4 py-[7px] font-mono text-[11.5px] ${
                  CHANGED[i] ? "bg-[#fef2f2] text-[#b91c1c]" : "bg-[#fafafb] text-zinc-500"
                }`}
              >
                <IconCircleMinus
                  size={12}
                  className={`shrink-0 ${CHANGED[i] ? "text-[#ef4444]" : "text-transparent"}`}
                />
                {line}
              </motion.div>
              {/* new panel */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.24 }}
                className={`flex items-center gap-2 px-4 py-[7px] font-mono text-[11.5px] ${
                  CHANGED[i] ? "bg-[#f0fdf4] text-[#15803d]" : "bg-white text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <IconCirclePlus
                  size={12}
                  className={`shrink-0 ${CHANGED[i] ? "text-[#22c55e]" : "text-transparent"}`}
                />
                {NEW[i]}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      {caption && <p className="mx-auto max-w-md text-center text-[13px] text-muted">{caption}</p>}
    </div>
  );
}