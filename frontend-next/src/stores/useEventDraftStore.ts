import { create } from "zustand";
import type { BoundaryLayer, LayerGroup, SelectedLocation } from "@/features/mypage/lib/location";

export type DraftPhoto = { id: string; url: string; name: string };

interface EventDraftState {
  title: string;
  description: string;
  tags: string[];
  startAt: string;
  location: SelectedLocation | null;
  detailAddress: string;
  photos: DraftPhoto[];
  layers: BoundaryLayer[];
  groups: LayerGroup[];

  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setTags: (updater: string[] | ((prev: string[]) => string[])) => void;
  setStartAt: (v: string) => void;
  setLocation: (v: SelectedLocation | null) => void;
  setDetailAddress: (v: string) => void;
  setPhotos: (updater: DraftPhoto[] | ((prev: DraftPhoto[]) => DraftPhoto[])) => void;
  // Moves the given photo to the front of the array — the first photo is always treated as the
  // event's cover/main image (see the "대표" badge in the create-event wizard).
  setMainPhoto: (id: string) => void;
  setLayers: (layers: BoundaryLayer[]) => void;
  setGroups: (groups: LayerGroup[]) => void;
  reset: () => void;
}

// Single source of truth for the create-event wizard. Held here (rather than local component
// state) so the wizard steps can be simple, swappable panels within one page without losing
// data as the user moves back and forth — this in-memory store (not persisted to localStorage —
// a full reload starts a fresh draft) is the shared state all steps read from and write to.
export const useEventDraftStore = create<EventDraftState>((set, get) => ({
  title: "",
  description: "",
  tags: [],
  startAt: "",
  location: null,
  detailAddress: "",
  photos: [],
  layers: [],
  groups: [],

  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setTags: (updater) =>
    set({ tags: typeof updater === "function" ? updater(get().tags) : updater }),
  setStartAt: (startAt) => set({ startAt }),
  setLocation: (location) => set({ location }),
  setDetailAddress: (detailAddress) => set({ detailAddress }),
  setPhotos: (updater) =>
    set({ photos: typeof updater === "function" ? updater(get().photos) : updater }),
  setMainPhoto: (id) =>
    set((state) => {
      const target = state.photos.find((p) => p.id === id);
      if (!target) return state;
      return { photos: [target, ...state.photos.filter((p) => p.id !== id)] };
    }),
  setLayers: (layers) => set({ layers }),
  setGroups: (groups) => set({ groups }),

  reset: () => {
    get().photos.forEach((p) => URL.revokeObjectURL(p.url));
    set({
      title: "",
      description: "",
      tags: [],
      startAt: "",
      location: null,
      detailAddress: "",
      photos: [],
      layers: [],
      groups: [],
    });
  },
}));
