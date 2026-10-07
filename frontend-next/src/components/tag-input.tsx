"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/40 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70";

// 이벤트 생성과 게시글 작성이 같이 쓰는 태그 입력: Enter로 추가(한글 조합 중 Enter는 무시),
// 중복은 무시, 칩의 X로 삭제.
export function TagInput({
  id,
  tags,
  onChange,
  placeholder,
  disabled = false,
}: {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");

  function commit() {
    const value = input.trim();
    if (!value) return;
    if (!tags.includes(value)) onChange([...tags, value]);
    setInput("");
  }

  return (
    <>
      <input
        id={id}
        disabled={disabled}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            e.preventDefault();
            commit();
          }
        }}
        placeholder={placeholder}
        className={inputClass}
      />
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                aria-label={t("mypage.create.tagRemove", { tag })}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
