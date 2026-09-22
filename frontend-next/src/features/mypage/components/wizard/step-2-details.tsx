"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Underline,
} from "lucide-react";
import { useEventDraftStore } from "@/stores/useEventDraftStore";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const FONT_FAMILIES: { value: string; labelKey: string }[] = [
  { value: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif", labelKey: "toolbarFontSans" },
  { value: "'Nanum Myeongjo', Georgia, serif", labelKey: "toolbarFontSerif" },
  { value: "'D2Coding', Consolas, monospace", labelKey: "toolbarFontMono" },
];

const FONT_SIZES: { value: string; labelKey: string }[] = [
  { value: "13px", labelKey: "toolbarFontSizeSmall" },
  { value: "15px", labelKey: "toolbarFontSizeNormal" },
  { value: "19px", labelKey: "toolbarFontSizeLarge" },
  { value: "25px", labelKey: "toolbarFontSizeXLarge" },
];

const TOGGLE_COMMANDS = [
  "bold",
  "italic",
  "underline",
  "justifyLeft",
  "justifyCenter",
  "justifyRight",
  "insertUnorderedList",
] as const;

function ToolbarButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center rounded-lg transition-colors ${
        active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarSelect({
  label,
  options,
  activeValue,
  onSelect,
}: {
  label: string;
  options: { label: string; value: string; style?: React.CSSProperties }[];
  activeValue?: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = !!activeValue;

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        aria-pressed={isActive}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors ${
          isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        {label}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-lg">
          {options.map((option) => {
            const selected = option.value === activeValue;
            return (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
                style={option.style}
                className={`block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                  selected ? "bg-primary/15 text-primary" : "text-foreground hover:bg-secondary"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Step2Details() {
  const { t } = useTranslation();
  const description = useEventDraftStore((s) => s.description);
  const setDescription = useEventDraftStore((s) => s.setDescription);
  const photos = useEventDraftStore((s) => s.photos);

  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [activeFontFamily, setActiveFontFamily] = useState("");
  const [activeFontSize, setActiveFontSize] = useState("");
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const photoPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!photoPickerOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!photoPickerRef.current?.contains(event.target as Node)) setPhotoPickerOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [photoPickerOpen]);

  // Load the draft description into the editor once on mount — after that the contentEditable
  // div is the source of truth and we only read from it, never rewrite its innerHTML from state
  // (that would fight the browser's own cursor position).
  useEffect(() => {
    if (editorRef.current && description) {
      editorRef.current.innerHTML = description;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resolveCaretNode(): Node | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.ELEMENT_NODE) return container;
    const el = container as Element;
    return el.childNodes[range.startOffset] ?? el.childNodes[range.startOffset - 1] ?? el;
  }

  function getInlineStyleAtSelection(prop: "fontFamily" | "fontSize"): string {
    if (!editorRef.current) return "";
    let node: Node | null = resolveCaretNode();
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    while (node instanceof HTMLElement && editorRef.current.contains(node)) {
      const value = node.style[prop];
      if (value) return value;
      if (node === editorRef.current) break;
      node = node.parentElement;
    }
    return "";
  }

  function normalizeFontFamily(value: string): string {
    const probe = document.createElement("span");
    probe.style.fontFamily = value;
    return probe.style.fontFamily;
  }

  function syncActiveFormats() {
    const selection = window.getSelection();
    if (!editorRef.current || !selection || selection.rangeCount === 0 || !editorRef.current.contains(selection.anchorNode)) {
      return;
    }
    const next: Record<string, boolean> = {};
    for (const command of TOGGLE_COMMANDS) {
      next[command] = document.queryCommandState(command);
    }
    setActiveFormats(next);

    const familyAtCaret = getInlineStyleAtSelection("fontFamily");
    const matchedFamily = FONT_FAMILIES.find(
      (font) => familyAtCaret && normalizeFontFamily(font.value) === familyAtCaret,
    );
    setActiveFontFamily(matchedFamily?.value ?? "");

    const sizeAtCaret = getInlineStyleAtSelection("fontSize");
    setActiveFontSize(FONT_SIZES.some((size) => size.value === sizeAtCaret) ? sizeAtCaret : "");
  }

  useEffect(() => {
    document.addEventListener("selectionchange", syncActiveFormats);
    return () => document.removeEventListener("selectionchange", syncActiveFormats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setDescription(editorRef.current?.innerHTML ?? "");
    syncActiveFormats();
  }

  function wrapSelectionWithStyle(styleProp: "fontFamily" | "fontSize", value: string) {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

    const fragment = range.cloneContents();
    const wrapper = document.createElement("span");
    wrapper.style[styleProp] = value;
    wrapper.appendChild(fragment);

    range.deleteContents();
    range.insertNode(wrapper);

    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setDescription(editorRef.current.innerHTML);
    syncActiveFormats();
  }

  function insertPhoto(url: string, name: string) {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<img src="${url}" alt="${name}" style="max-width:100%;border-radius:12px;margin:12px 0" />`,
    );
    setDescription(editorRef.current?.innerHTML ?? "");
    setPhotoPickerOpen(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        {t("mypage.create.descriptionLabel")}
      </label>
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-border bg-secondary/60 p-1">
        <ToolbarButton label={t("community.writePage.toolbarBold")} onClick={() => exec("bold")} active={activeFormats.bold}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label={t("community.writePage.toolbarItalic")} onClick={() => exec("italic")} active={activeFormats.italic}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton label={t("community.writePage.toolbarUnderline")} onClick={() => exec("underline")} active={activeFormats.underline}>
          <Underline className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarSelect
          label={t("community.writePage.toolbarFontFamily")}
          options={FONT_FAMILIES.map((font) => ({
            label: t(`community.writePage.${font.labelKey}`),
            value: font.value,
            style: { fontFamily: font.value },
          }))}
          activeValue={activeFontFamily}
          onSelect={(value) => wrapSelectionWithStyle("fontFamily", value)}
        />
        <ToolbarSelect
          label={t("community.writePage.toolbarFontSize")}
          options={FONT_SIZES.map((size) => ({
            label: t(`community.writePage.${size.labelKey}`),
            value: size.value,
          }))}
          activeValue={activeFontSize}
          onSelect={(value) => wrapSelectionWithStyle("fontSize", value)}
        />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton label={t("community.writePage.toolbarAlignLeft")} onClick={() => exec("justifyLeft")} active={activeFormats.justifyLeft}>
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton label={t("community.writePage.toolbarAlignCenter")} onClick={() => exec("justifyCenter")} active={activeFormats.justifyCenter}>
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton label={t("community.writePage.toolbarAlignRight")} onClick={() => exec("justifyRight")} active={activeFormats.justifyRight}>
          <AlignRight className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton label={t("community.writePage.toolbarList")} onClick={() => exec("insertUnorderedList")} active={activeFormats.insertUnorderedList}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("community.writePage.toolbarLink")}
          onClick={() => {
            const url = window.prompt(t("community.writePage.toolbarLinkPrompt"));
            if (url) exec("createLink", url);
          }}
        >
          <Link2 className="size-4" />
        </ToolbarButton>
        <div className="relative" ref={photoPickerRef}>
          <ToolbarButton
            label={t("mypage.create.insertPhoto")}
            onClick={() => setPhotoPickerOpen((v) => !v)}
          >
            <ImageIcon className="size-4" />
          </ToolbarButton>
          {photoPickerOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-card p-2 shadow-lg">
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {photos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => insertPhoto(p.url, p.name)}
                      className="aspect-square overflow-hidden rounded-md border border-border hover:border-primary"
                    >
                      <img src={p.url} alt={p.name} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-2 text-xs text-muted-foreground">
                  {t("mypage.create.insertPhotoEmpty")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        id="event-description"
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => setDescription(event.currentTarget.innerHTML)}
        data-placeholder={t("mypage.create.descriptionPlaceholder")}
        className="min-h-56 w-full rounded-b-xl border border-t-0 border-border bg-background p-4 text-sm leading-relaxed outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
