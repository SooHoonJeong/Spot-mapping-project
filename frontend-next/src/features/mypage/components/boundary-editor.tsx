"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  Eye,
  EyeOff,
  FolderPlus,
  Pencil,
  Plus,
  Route,
  Shapes,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEventDraftStore } from "@/stores/useEventDraftStore";
import {
  LAYER_COLORS,
  type BoundaryLayer,
  type EditableBoundaryPoint,
  type LayerGroup,
} from "../lib/location";
import type { EditorLayer } from "./boundary-map";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

// Module-level (not refs) so they can be read during the initial useState() render without
// tripping the "no ref access during render" rule — a ref would need reading in the lazy
// initializer, which React treats as a render-phase read.
let nextPointId = 0;
let nextLayerId = 0;
let nextGroupId = 0;

function MapLoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <span className="text-sm text-muted-foreground">{t("mapExplorer.loadingMap")}</span>
    </div>
  );
}

const BoundaryMap = dynamic(() => import("./boundary-map"), {
  ssr: false,
  loading: MapLoadingFallback,
});

function toEditorLayer(layer: BoundaryLayer): EditorLayer {
  return { ...layer, points: layer.points.map((p) => ({ ...p, id: nextPointId++ })) };
}

export function BoundaryEditor({
  center,
}: {
  center: { lat: number; lng: number } | null;
}) {
  const { t } = useTranslation();
  const storedLayers = useEventDraftStore((s) => s.layers);
  const storedGroups = useEventDraftStore((s) => s.groups);

  const [layers, setLayers] = useState<EditorLayer[]>(() => {
    if (storedLayers.length > 0) return storedLayers.map(toEditorLayer);
    return [
      {
        id: nextLayerId++,
        name: t("mypage.create.boundary.layerDefaultName", { n: 1 }),
        color: LAYER_COLORS[0],
        points: [],
        groupId: null,
        shape: "area",
      },
    ];
  });
  const [groups, setGroups] = useState<LayerGroup[]>(storedGroups);
  const [activeLayerId, setActiveLayerId] = useState(() => layers[0].id);

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [newLayerOpen, setNewLayerOpen] = useState(false);
  const [newLayerShape, setNewLayerShape] = useState<"area" | "line">("area");
  const [newLayerName, setNewLayerName] = useState("");
  const [newLayerColor, setNewLayerColor] = useState<string>(LAYER_COLORS[0]);
  const [editingLayerId, setEditingLayerId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<string>(LAYER_COLORS[0]);

  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState<string>(LAYER_COLORS[0]);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupColor, setEditGroupColor] = useState<string>(LAYER_COLORS[0]);

  function isLayerComplete(layer: EditorLayer) {
    return layer.shape === "line" ? layer.points.length >= 2 : layer.points.length >= 3;
  }

  // Synced continuously (rather than on an explicit "완료" click) because this editor is now a
  // panel inside the create-event wizard's map step — the wizard's own "다음" button is what
  // moves the user forward, so whatever is drawn here needs to already be in the draft store by
  // the time that happens.
  useEffect(() => {
    const completeLayers: BoundaryLayer[] = layers
      .filter(isLayerComplete)
      .map(({ id, name, color, points, groupId, shape }) => ({
        id,
        name,
        color,
        groupId,
        shape,
        points: points.map(({ lat, lng }) => ({ lat, lng })),
      }));
    useEventDraftStore.getState().setLayers(completeLayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  useEffect(() => {
    useEventDraftStore.getState().setGroups(groups);
  }, [groups]);

  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? layers[0];

  function updateActiveLayerPoints(
    updater: (points: EditableBoundaryPoint[]) => EditableBoundaryPoint[],
  ) {
    setLayers((prev) =>
      prev.map((l) => (l.id === activeLayerId ? { ...l, points: updater(l.points) } : l)),
    );
  }

  function addPoint(lat: number, lng: number) {
    updateActiveLayerPoints((points) => [...points, { lat, lng, id: nextPointId++ }]);
  }

  function movePoint(id: number, lat: number, lng: number) {
    updateActiveLayerPoints((points) =>
      points.map((p) => (p.id === id ? { ...p, lat, lng } : p)),
    );
  }

  function deletePoint(id: number) {
    // Just remove the point — the polygon/polyline is drawn from the remaining points in
    // order, so its neighbors connect directly to each other automatically.
    updateActiveLayerPoints((points) => points.filter((p) => p.id !== id));
  }

  function handleUndo() {
    updateActiveLayerPoints((points) => points.slice(0, -1));
  }

  function handleClear() {
    updateActiveLayerPoints(() => []);
  }

  function selectLayer(layer: EditorLayer) {
    setActiveLayerId(layer.id);
    // Selecting a layer whose group is currently hidden would leave it invisible on the map
    // with no obvious way to see what you're editing — surface its group automatically.
    if (layer.groupId !== null) {
      setGroups((prev) =>
        prev.map((g) => (g.id === layer.groupId ? { ...g, visible: true } : g)),
      );
    }
  }

  function openNewLayerForm(shape: "area" | "line") {
    const color = LAYER_COLORS[layers.length % LAYER_COLORS.length];
    const nameKey =
      shape === "line"
        ? "mypage.create.boundary.lineDefaultName"
        : "mypage.create.boundary.layerDefaultName";
    setNewLayerShape(shape);
    setNewLayerName(t(nameKey, { n: layers.length + 1 }));
    setNewLayerColor(color);
    setEditingLayerId(null);
    setAddMenuOpen(false);
    setNewGroupOpen(false);
    setNewLayerOpen(true);
  }

  function confirmNewLayer() {
    const id = nextLayerId++;
    const nameKey =
      newLayerShape === "line"
        ? "mypage.create.boundary.lineDefaultName"
        : "mypage.create.boundary.layerDefaultName";
    const name = newLayerName.trim() || t(nameKey, { n: layers.length + 1 });
    setLayers((prev) => [
      ...prev,
      { id, name, color: newLayerColor, points: [], groupId: null, shape: newLayerShape },
    ]);
    setActiveLayerId(id);
    setNewLayerOpen(false);
  }

  function openEditLayerForm(layer: EditorLayer) {
    setNewLayerOpen(false);
    setEditName(layer.name);
    setEditColor(layer.color);
    setEditingLayerId(layer.id);
  }

  function confirmEditLayer() {
    if (editingLayerId === null) return;
    const name = editName.trim() || t("mypage.create.boundary.layerDefaultName", { n: 1 });
    setLayers((prev) =>
      prev.map((l) => (l.id === editingLayerId ? { ...l, name, color: editColor } : l)),
    );
    setEditingLayerId(null);
  }

  function deleteLayer(id: number) {
    const target = layers.find((l) => l.id === id);
    if (!target) return;
    if (!window.confirm(t("mypage.create.boundary.deleteLayerConfirm", { name: target.name }))) {
      return;
    }

    const remaining = layers.filter((l) => l.id !== id);
    if (remaining.length > 0) {
      setLayers(remaining);
      if (id === activeLayerId) setActiveLayerId(remaining[0].id);
      return;
    }
    // Never leave the editor with zero layers — start a fresh one instead.
    const freshId = nextLayerId++;
    setLayers([
      {
        id: freshId,
        name: t("mypage.create.boundary.layerDefaultName", { n: 1 }),
        color: LAYER_COLORS[0],
        points: [],
        groupId: null,
        shape: "area",
      },
    ]);
    setActiveLayerId(freshId);
  }

  function assignLayerToGroup(layerId: number, groupId: number | null) {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== layerId) return l;
        if (groupId === null) return { ...l, groupId: null };
        // Joining a group means visually matching it — the group's color becomes the single
        // source of truth for all its members until they're recolored via the group itself.
        const group = groups.find((g) => g.id === groupId);
        return { ...l, groupId, color: group ? group.color : l.color };
      }),
    );
  }

  function openNewGroupForm() {
    const color = LAYER_COLORS[groups.length % LAYER_COLORS.length];
    setNewGroupName(t("mypage.create.boundary.groupDefaultName", { n: groups.length + 1 }));
    setNewGroupColor(color);
    setEditingGroupId(null);
    setAddMenuOpen(false);
    setNewLayerOpen(false);
    setNewGroupOpen(true);
  }

  function confirmNewGroup() {
    const id = nextGroupId++;
    const name =
      newGroupName.trim() ||
      t("mypage.create.boundary.groupDefaultName", { n: groups.length + 1 });
    setGroups((prev) => [...prev, { id, name, color: newGroupColor, visible: true }]);
    setNewGroupOpen(false);
  }

  function openEditGroupForm(group: LayerGroup) {
    setNewGroupOpen(false);
    setEditGroupName(group.name);
    setEditGroupColor(group.color);
    setEditingGroupId(group.id);
  }

  function confirmEditGroup() {
    if (editingGroupId === null) return;
    const name = editGroupName.trim() || t("mypage.create.boundary.groupDefaultName", { n: 1 });
    setGroups((prev) =>
      prev.map((g) => (g.id === editingGroupId ? { ...g, name, color: editGroupColor } : g)),
    );
    // Bulk recolor: every member layer snaps to the group's (possibly new) color.
    setLayers((prev) =>
      prev.map((l) => (l.groupId === editingGroupId ? { ...l, color: editGroupColor } : l)),
    );
    setEditingGroupId(null);
  }

  function toggleGroupVisibility(id: number) {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, visible: !g.visible } : g)));
  }

  function deleteGroup(id: number) {
    const target = groups.find((g) => g.id === id);
    if (!target) return;
    if (!window.confirm(t("mypage.create.boundary.deleteGroupConfirm", { name: target.name }))) {
      return;
    }
    setGroups((prev) => prev.filter((g) => g.id !== id));
    // Ungroup rather than delete — the drawn areas are the expensive part to redo.
    setLayers((prev) => prev.map((l) => (l.groupId === id ? { ...l, groupId: null } : l)));
  }

  const activePointCount = activeLayer.points.length;

  // Hidden groups' layers still exist and can still be finished/saved — visibility only
  // affects what's drawn on this editor's map, not what "완료" persists.
  const visibleLayers = layers.filter((l) => {
    if (l.groupId === null) return true;
    const group = groups.find((g) => g.id === l.groupId);
    return group ? group.visible : true;
  });

  function renderLayerChip(layer: EditorLayer) {
    if (editingLayerId === layer.id) {
      return (
        <div
          key={layer.id}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1"
        >
          <div className="flex items-center gap-1">
            {LAYER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setEditColor(color)}
                aria-label={color}
                className={cn(
                  "size-4 rounded-full ring-offset-1",
                  editColor === color && "ring-2 ring-foreground",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={t("mypage.create.boundary.layerNamePlaceholder")}
            className="h-6 w-28 rounded-md border border-input bg-background px-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={confirmEditLayer}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t("mypage.create.boundary.saveLayer")}
          </button>
          <button
            type="button"
            onClick={() => setEditingLayerId(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("mypage.create.boundary.addLayerCancel")}
          </button>
        </div>
      );
    }

    return (
      <div
        key={layer.id}
        className={cn(
          "group flex items-center gap-1 rounded-full border pl-2.5 pr-1 py-1 text-xs font-medium transition",
          layer.id === activeLayerId
            ? "border-foreground/30 bg-card shadow-sm"
            : "border-border bg-background text-muted-foreground hover:text-foreground",
        )}
      >
        <button type="button" onClick={() => selectLayer(layer)} className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: layer.color }}
          />
          {layer.name}
          {!isLayerComplete(layer) && (
            <span className="text-[10px] text-muted-foreground">
              (
              {t(
                layer.shape === "line"
                  ? "mypage.create.boundary.incompleteLineHint"
                  : "mypage.create.boundary.incompleteLayerHint",
              )}
              )
            </span>
          )}
          {layer.shape === "line" && (
            <Route className="size-2.5 shrink-0 text-muted-foreground" />
          )}
        </button>
        <select
          value={layer.groupId ?? ""}
          onChange={(e) =>
            assignLayerToGroup(layer.id, e.target.value ? Number(e.target.value) : null)
          }
          title={t("mypage.create.boundary.assignGroupLabel")}
          className="h-4 max-w-16 rounded border-0 bg-transparent text-[10px] text-muted-foreground outline-none"
        >
          <option value="">{t("mypage.create.boundary.noGroupOption")}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => openEditLayerForm(layer)}
          className="flex size-3.5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
        >
          <Pencil className="size-3" />
        </button>
        <button
          type="button"
          onClick={() => deleteLayer(layer.id)}
          className="flex size-3.5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          <X className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-secondary/40 px-4 py-5">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-balance text-xl font-bold tracking-tight">
              {t("mypage.create.boundary.title")}
            </h2>
            <p className="mt-1 max-w-xl text-pretty text-sm text-muted-foreground">
              {t("mypage.create.boundary.subtitle")}
            </p>
            <p className="mt-0.5 max-w-xl text-pretty text-xs text-muted-foreground">
              {t("mypage.create.boundary.editHint")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t("mypage.create.boundary.pointsCount", { count: activePointCount })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={activePointCount === 0}
              className="gap-1.5"
            >
              <Undo2 className="size-3.5" />
              {t("mypage.create.boundary.undo")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={activePointCount === 0}
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" />
              {t("mypage.create.boundary.clear")}
            </Button>
          </div>
        </div>

        {/* Layers & groups */}
        <div className="mx-auto mt-4 flex w-full max-w-7xl flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("mypage.create.boundary.layersLabel")}
          </span>

          {groups.map((group) => (
            <div key={group.id} className="flex flex-wrap items-center gap-1.5">
              {editingGroupId === group.id ? (
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1">
                  <div className="flex items-center gap-1">
                    {LAYER_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditGroupColor(color)}
                        aria-label={color}
                        className={cn(
                          "size-4 rounded-full ring-offset-1",
                          editGroupColor === color && "ring-2 ring-foreground",
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    autoFocus
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    placeholder={t("mypage.create.boundary.groupNamePlaceholder")}
                    className="h-6 w-28 rounded-md border border-input bg-background px-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={confirmEditGroup}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {t("mypage.create.boundary.saveLayer")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGroupId(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("mypage.create.boundary.addLayerCancel")}
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleGroupVisibility(group.id)}
                    className="flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {group.visible ? (
                      <Eye className="size-3.5" />
                    ) : (
                      <EyeOff className="size-3.5" />
                    )}
                  </button>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                  <button
                    type="button"
                    onClick={() => openEditGroupForm(group)}
                    className="flex size-3.5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteGroup(group.id)}
                    className="flex size-3.5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}

              {layers.filter((l) => l.groupId === group.id).map(renderLayerChip)}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-1.5">
            {layers.filter((l) => l.groupId === null).map(renderLayerChip)}

            {newLayerOpen ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1">
                <div className="flex items-center gap-1">
                  {LAYER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewLayerColor(color)}
                      aria-label={color}
                      className={cn(
                        "size-4 rounded-full ring-offset-1",
                        newLayerColor === color && "ring-2 ring-foreground",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  autoFocus
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  placeholder={t("mypage.create.boundary.layerNamePlaceholder")}
                  className="h-6 w-28 rounded-md border border-input bg-background px-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={confirmNewLayer}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t("mypage.create.boundary.addLayerConfirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setNewLayerOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("mypage.create.boundary.addLayerCancel")}
                </button>
              </div>
            ) : null}

            {newGroupOpen ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1">
                <div className="flex items-center gap-1">
                  {LAYER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewGroupColor(color)}
                      aria-label={color}
                      className={cn(
                        "size-4 rounded-full ring-offset-1",
                        newGroupColor === color && "ring-2 ring-foreground",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t("mypage.create.boundary.groupNamePlaceholder")}
                  className="h-6 w-28 rounded-md border border-input bg-background px-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={confirmNewGroup}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t("mypage.create.boundary.addLayerConfirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setNewGroupOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("mypage.create.boundary.addLayerCancel")}
                </button>
              </div>
            ) : null}

            {!newLayerOpen && !newGroupOpen && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAddMenuOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Plus className="size-3.5" />
                  {t("mypage.create.boundary.addButton")}
                  <ChevronDown className="size-3" />
                </button>
                {addMenuOpen && (
                  <div className="absolute left-0 top-full z-[1000] mt-1 flex w-36 flex-col gap-0.5 rounded-lg border border-border bg-card p-1 shadow-md">
                    <button
                      type="button"
                      onClick={() => openNewLayerForm("area")}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Shapes className="size-3.5 text-muted-foreground" />
                      {t("mypage.create.boundary.newLayer")}
                    </button>
                    <button
                      type="button"
                      onClick={() => openNewLayerForm("line")}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Route className="size-3.5 text-muted-foreground" />
                      {t("mypage.create.boundary.newLine")}
                    </button>
                    <button
                      type="button"
                      onClick={openNewGroupForm}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <FolderPlus className="size-3.5 text-muted-foreground" />
                      {t("mypage.create.boundary.newGroup")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[75svh] min-h-[420px]">
        <BoundaryMap
          center={center}
          layers={visibleLayers}
          activeLayerId={activeLayerId}
          onAddPoint={addPoint}
          onMovePoint={movePoint}
          onDeletePoint={deletePoint}
        />
      </div>
    </div>
  );
}
