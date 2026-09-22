"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ImagePlus,
  Italic,
  Link2,
  List,
  Paperclip,
  Tag,
  Underline,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/features/events/lib/useEvents";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

type Mode = "quick" | "detailed";
type MediaPreview = { url: string; type: "image" | "video"; name: string };

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

// document.queryCommandState reports whether each of these is currently active at the
// cursor/selection — used to give the toggle buttons a pressed state.
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
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// 네이티브 <select>는 열릴 때 포커스가 이동하면서 contentEditable의 텍스트 선택이 풀려버려서,
// Bold/Italic 버튼과 동일하게 onMouseDown을 막아 선택 영역을 유지하는 커스텀 드롭다운을 사용.
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
          isActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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

export function CommunityPostForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const tagSearchRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("quick");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [debouncedTagQuery, setDebouncedTagQuery] = useState("");
  const [isTagSearchOpen, setIsTagSearchOpen] = useState(false);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [activeFontFamily, setActiveFontFamily] = useState("");
  const [activeFontSize, setActiveFontSize] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedTagQuery(tagQuery.trim()), 300);
    return () => clearTimeout(id);
  }, [tagQuery]);

  useEffect(() => {
    if (!isTagSearchOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!tagSearchRef.current?.contains(event.target as Node)) {
        setIsTagSearchOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isTagSearchOpen]);

  // 이벤트 태그 검색은 목업 목록 대신 실제 GET /api/events(keyword)를 사용
  const { events: tagResults } = useEvents({
    keyword: debouncedTagQuery || undefined,
    size: 8,
  });

  // wrapSelectionWithStyle이 새로 감싼 span의 내용 전체를 다시 선택해두기 때문에, 선택 시작
  // 지점(anchorNode/startContainer)이 실제 텍스트가 아니라 그 span 자신(오프셋 0)을 가리키는
  // 경우가 있다. 이때 startContainer에서 곧장 위로만 올라가면 그 span의 "자식"으로 들어있는
  // (더 안쪽에서 감싼) 스타일은 조상 경로에 없어서 건너뛰게 된다. 그래서 실제 컨텐츠 노드
  // (텍스트 노드 또는 그 위치의 자식 요소)부터 탐색을 시작하도록 먼저 내려간다.
  function resolveCaretNode(): Node | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.ELEMENT_NODE) return container;
    const el = container as Element;
    return el.childNodes[range.startOffset] ?? el.childNodes[range.startOffset - 1] ?? el;
  }

  // 글꼴/글자 크기는 execCommand가 아니라 직접 감싼 <span style="..."> 로 적용하기 때문에
  // queryCommandState로는 알 수 없음. 커서 위치에서부터 에디터 루트까지 조상을 거슬러 올라가며
  // 가장 가까운 인라인 font-family/font-size 값을 찾아 반환한다.
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

  // FONT_FAMILIES의 원본 문자열과 브라우저가 실제로 적용한 뒤 돌려주는 인라인 스타일 문자열은
  // 따옴표 표기 등이 달라질 수 있어서, 똑같은 style 세터를 한 번 거쳐 같은 방식으로 정규화한
  // 값끼리 비교한다.
  function normalizeFontFamily(value: string): string {
    const probe = document.createElement("span");
    probe.style.fontFamily = value;
    return probe.style.fontFamily;
  }

  function syncActiveFormats() {
    const selection = window.getSelection();
    // 다른 곳(제목 입력, 페이지의 다른 요소 등)을 클릭해 선택이 에디터 밖으로 나가면 아무것도
    // 하지 않고 마지막 상태를 그대로 유지한다. 여기서 {}로 리셋해버리면 본문으로 돌아오기 전
    // 잠깐 버튼이 꺼졌다 켜지는 것처럼 보여서 "적용해둔 서식이 풀렸다"는 오해를 줌.
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
    setContent(editorRef.current?.innerHTML ?? "");
    syncActiveFormats();
  }

  // execCommand has no font-family/font-size commands with arbitrary values (fontSize only
  // supports the legacy 1–7 scale), and layering execCommand("fontName")/("fontSize") back to
  // back on the same selection lets the browser silently replace the earlier <font> tag instead
  // of nesting it, dropping whichever was applied first. Wrapping the selection in a styled
  // <span> ourselves via the Range API avoids that and correctly nests family + size together.
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

    // Re-select the wrapped text so a follow-up format (e.g. size right after family) still
    // has something to apply to.
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setContent(editorRef.current.innerHTML);
    syncActiveFormats();
  }

  function applyFontFamily(family: string) {
    wrapSelectionWithStyle("fontFamily", family);
  }

  function applyFontSize(px: string) {
    wrapSelectionWithStyle("fontSize", px);
  }

  function insertMedia(file: File) {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video/") ? "video" : "image";
    setMedia((items) => [...items, { url, type, name: file.name }]);
    if (mode === "detailed" && editorRef.current) {
      editorRef.current.focus();
      document.execCommand(
        "insertHTML",
        false,
        type === "video"
          ? `<video controls src="${url}" style="max-width:100%;border-radius:12px;margin:12px 0"></video>`
          : `<img src="${url}" alt="${file.name}" style="max-width:100%;border-radius:12px;margin:12px 0" />`,
      );
      setContent(editorRef.current.innerHTML);
    }
  }

  function removeMedia(index: number) {
    URL.revokeObjectURL(media[index].url);
    setMedia((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function toggleTag(eventTitle: string) {
    setTags((current) =>
      current.includes(eventTitle)
        ? current.filter((item) => item !== eventTitle)
        : [...current, eventTitle],
    );
  }

  function selectTagFromResults(eventTitle: string) {
    toggleTag(eventTitle);
    setIsTagSearchOpen(false);
    setTagQuery("");
  }

  // TODO: mock — 커뮤니티 글 작성 API가 아직 없어서 실제로 게시글을 만들지 않고 성공 화면만 보여준 뒤
  // 피드로 돌아감. 백엔드에 커뮤니티 도메인이 추가되면 실제 POST 요청으로 교체해야 함.
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !content.replace(/<[^>]*>/g, "").trim()) return;
    setSubmitted(true);
    window.setTimeout(() => router.push("/community"), 900);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-semibold">
          {t("community.writePage.submittedTitle")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("community.writePage.submittedDescription")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl px-4 pb-12">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{t("community.writePage.composeTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("community.writePage.composeSubtitle")}
            </p>
          </div>
          <div className="flex rounded-xl bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                mode === "quick" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t("community.writePage.modeQuick")}
            </button>
            <button
              type="button"
              onClick={() => setMode("detailed")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                mode === "detailed" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t("community.writePage.modeDetailed")}
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_260px]">
          <div>
            <label htmlFor="post-title" className="text-sm font-semibold">
              {t("community.writePage.titleLabel")}
            </label>
            <input
              id="post-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("community.writePage.titlePlaceholder")}
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative" ref={tagSearchRef}>
            <label htmlFor="event-tag-search" className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="size-4 text-primary" />
              {t("community.writePage.tagLabel")}{" "}
              <span className="font-normal text-muted-foreground">
                {t("community.writePage.tagOptional")}
              </span>
            </label>
            <div className="relative mt-2">
              <input
                id="event-tag-search"
                value={tagQuery}
                onFocus={() => setIsTagSearchOpen(true)}
                onChange={(e) => {
                  setTagQuery(e.target.value);
                  setIsTagSearchOpen(true);
                }}
                placeholder={t("community.writePage.tagSearchPlaceholder")}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                aria-describedby="event-tag-help"
                aria-controls="event-tag-results"
                autoComplete="off"
              />
              {tagQuery && (
                <button
                  type="button"
                  onClick={() => setTagQuery("")}
                  aria-label={t("community.writePage.tagClear")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <p id="event-tag-help" className="mt-1.5 text-xs text-muted-foreground">
              {t("community.writePage.tagHelp")}
            </p>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((eventTitle) => (
                  <button
                    key={eventTitle}
                    type="button"
                    onClick={() => toggleTag(eventTitle)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    aria-label={t("community.writePage.tagRemove", { title: eventTitle })}
                  >
                    {eventTitle}
                    <X className="size-3" />
                  </button>
                ))}
              </div>
            )}
            {isTagSearchOpen && (
              <div
                id="event-tag-results"
                role="listbox"
                aria-label={t("community.writePage.tagLabel")}
                aria-multiselectable="true"
                className="absolute left-0 right-0 z-50 mt-2 max-h-52 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg"
              >
                {tagResults.length > 0 ? (
                  tagResults.map((eventItem) => {
                    const selected = tags.includes(eventItem.title);
                    return (
                      <button
                        key={eventItem.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => selectTagFromResults(eventItem.title)}
                        className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors hover:bg-secondary ${
                          selected ? "bg-primary/10 text-primary" : "text-foreground"
                        }`}
                      >
                        <span
                          className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {selected && "✓"}
                        </span>
                        <span className="truncate">{eventItem.title}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-3 text-xs text-muted-foreground">
                    {t("community.writePage.tagNoResults")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="post-content" className="text-sm font-semibold">
            {mode === "quick"
              ? t("community.writePage.contentLabelQuick")
              : t("community.writePage.contentLabelDetailed")}
          </label>
          {mode === "detailed" && (
            <div className="mt-3 flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-border bg-secondary/60 p-1">
              <ToolbarButton
                label={t("community.writePage.toolbarBold")}
                onClick={() => exec("bold")}
                active={activeFormats.bold}
              >
                <Bold className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t("community.writePage.toolbarItalic")}
                onClick={() => exec("italic")}
                active={activeFormats.italic}
              >
                <Italic className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t("community.writePage.toolbarUnderline")}
                onClick={() => exec("underline")}
                active={activeFormats.underline}
              >
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
                onSelect={applyFontFamily}
              />
              <ToolbarSelect
                label={t("community.writePage.toolbarFontSize")}
                options={FONT_SIZES.map((size) => ({
                  label: t(`community.writePage.${size.labelKey}`),
                  value: size.value,
                }))}
                activeValue={activeFontSize}
                onSelect={applyFontSize}
              />
              <span className="mx-1 h-5 w-px bg-border" />
              <ToolbarButton
                label={t("community.writePage.toolbarAlignLeft")}
                onClick={() => exec("justifyLeft")}
                active={activeFormats.justifyLeft}
              >
                <AlignLeft className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t("community.writePage.toolbarAlignCenter")}
                onClick={() => exec("justifyCenter")}
                active={activeFormats.justifyCenter}
              >
                <AlignCenter className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label={t("community.writePage.toolbarAlignRight")}
                onClick={() => exec("justifyRight")}
                active={activeFormats.justifyRight}
              >
                <AlignRight className="size-4" />
              </ToolbarButton>
              <span className="mx-1 h-5 w-px bg-border" />
              <ToolbarButton
                label={t("community.writePage.toolbarList")}
                onClick={() => exec("insertUnorderedList")}
                active={activeFormats.insertUnorderedList}
              >
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
              <ToolbarButton
                label={t("community.writePage.toolbarMedia")}
                onClick={() => mediaInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </ToolbarButton>
            </div>
          )}
          <div
            id="post-content"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => setContent(event.currentTarget.innerHTML)}
            data-placeholder={
              mode === "quick"
                ? t("community.writePage.contentPlaceholderQuick")
                : t("community.writePage.contentPlaceholderDetailed")
            }
            className={`min-h-44 w-full rounded-xl border border-border bg-background p-4 text-sm leading-relaxed outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] focus:border-primary focus:ring-2 focus:ring-primary/30 ${
              mode === "detailed" ? "rounded-t-none border-t-0" : ""
            }`}
          />
        </div>

        {mode === "quick" && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {t("community.writePage.mediaLabel")}{" "}
                <span className="font-normal text-muted-foreground">
                  {t("community.writePage.mediaMax")}
                </span>
              </span>
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                onClick={() => mediaInputRef.current?.click()}
                disabled={media.length >= 4}
              >
                <ImagePlus className="size-4" />
                {t("community.writePage.addMedia")}
              </Button>
            </div>
          </div>
        )}
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            Array.from(e.target.files ?? []).slice(0, 4 - media.length).forEach(insertMedia);
            e.target.value = "";
          }}
        />
        {media.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {media.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
              >
                {item.type === "video" ? (
                  <video src={item.url} muted playsInline controls className="size-full object-cover" />
                ) : (
                  <img src={item.url} alt={item.name} className="size-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  aria-label={t("community.writePage.removeMedia", { name: item.name })}
                  className="absolute right-2 top-2 rounded-full bg-foreground/75 p-1.5 text-background opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-end gap-3 border-t border-border pt-5">
          <Button type="button" variant="ghost" nativeButton={false} render={<Link href="/community" />}>
            {t("community.writePage.cancel")}
          </Button>
          <Button type="submit" disabled={!title.trim() || !content.replace(/<[^>]*>/g, "").trim()}>
            {t("community.writePage.publish")}
          </Button>
        </div>
      </div>
    </form>
  );
}
