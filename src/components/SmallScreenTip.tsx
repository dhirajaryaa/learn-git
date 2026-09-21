"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconDeviceMobile, IconX } from "@tabler/icons-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useMediaQuery } from "@/components/useMediaQuery";

export function SmallScreenTip() {
  const { ui } = useI18n();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("git-tip-dismissed") === "1"
  );

  const dismiss = () => {
    sessionStorage.setItem("git-tip-dismissed", "1");
    setDismissed(true);
  };

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-b border-accent/20 bg-accent-soft dark:bg-accent/10"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2.5">
            <IconDeviceMobile size={15} className="shrink-0 text-accent" />
            <p className="flex-1 text-[12.5px] leading-snug text-foreground">
              {ui.tip.body}
            </p>
            <button
              onClick={dismiss}
              aria-label={ui.tip.dismissAria}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            >
              <IconX size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}