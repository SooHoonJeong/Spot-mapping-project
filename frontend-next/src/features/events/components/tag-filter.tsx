"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function TagFilter({
  tags,
  selected,
  onChange,
}: {
  tags: string[];
  selected: string | "All";
  onChange: (value: string | "All") => void;
}) {
  const { t } = useTranslation();
  if (tags.length === 0) return null;
  const options: (string | "All")[] = ["All", ...tags];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {option === "All" ? t("tagFilter.all") : option}
          </button>
        );
      })}
    </div>
  );
}
