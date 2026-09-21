"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { IconArrowUp } from "@tabler/icons-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

function subscribe(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  window.addEventListener("resize", cb);
  return () => {
    window.removeEventListener("scroll", cb);
    window.removeEventListener("resize", cb);
  };
}

function getSnapshot() {
  return window.scrollY > 480;
}

export function BackToTop() {
  const { ui } = useI18n();
  const visible = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return (
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={ui.nav.backToTop}
      className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-foreground shadow-lg shadow-black/10 transition-colors hover:border-accent/40 hover:text-accent dark:bg-zinc-900 dark:shadow-black/40"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
    >
      <IconArrowUp size={18} />
    </motion.button>
  );
}