"use client";

import { cn } from "@/lib/utils";
import { CATEGORIES, type EventCategory } from "../lib/events";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function CategoryFilter({
  selected,
  onChange,
}: {
  selected: EventCategory | "All";
  onChange: (value: EventCategory | "All") => void;
}) {
  const { t } = useTranslation();
  const options: (EventCategory | "All")[] = ["All", ...CATEGORIES];
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
            {t(`categories.${option}`)}
          </button>
        );
      })}
    </div>
  );
}
