"use client";
import { useState } from "react";
import { translate, Locale } from "@/utils/i18n";

export default function DescriptionClamp({ text, clampLines = 2, locale }: { text: string; clampLines?: number; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className={expanded ? "" : "relative"}>
        {expanded ? (
          <p className="text-base text-neutral-700 dark:text-neutral-300 leading-7 whitespace-pre-line">
            {text}
          </p>
        ) : (
          <p
            className="text-base text-neutral-700 dark:text-neutral-300 leading-7 whitespace-pre-line overflow-hidden [display:-webkit-box] [word-break:break-word] [text-overflow:ellipsis]"
            style={{ WebkitLineClamp: clampLines, WebkitBoxOrient: "vertical" as const }}
          >
            {text}
          </p>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 underline hover:text-emerald-600 transition-colors"
        >
          {expanded ? translate(locale, "common.viewLess") : translate(locale, "common.viewMore")}
        </button>
      </div>
    </div>
  );
}

