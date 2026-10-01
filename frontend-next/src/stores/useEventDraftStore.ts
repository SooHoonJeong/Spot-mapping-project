import { create } from "zustand";
import type { BoundaryLayer, LayerGroup, SelectedLocation } from "@/features/mypage/lib/location";

export type DraftPhoto = {
  id: string;
  url: string;
  name: string;
  // "uploading"/"error" photos show a local blob: preview; once upload finishes, `url` is
  // swapped to the server's presigned previewUrl and `photoKey` is set for the submit payload.
  status: "uploading" | "done" | "error";
  photoKey?: string;
};

interface EventDraftState {
  title: string;
  description: string;
  tags: string[];
  startAt: string;
  location: SelectedLocation | null;
  detailAddress: string;
  price: number | null;
  maxAttendees: number | null;
  photos: DraftPhoto[];
  layers: BoundaryLayer[];
  groups: LayerGroup[];

  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setTags: (updater: string[] | ((prev: string[]) => string[])) => void;
  setStartAt: (v: string) => void;
  setLocation: (v: SelectedLocation | null) => void;
  setDetailAddress: (v: string) => void;
  setPrice: (v: number | null) => void;
  setMaxAttendees: (v: number | null) => void;
  setPhotos: (updater: DraftPhoto[] | ((prev: DraftPhoto[]) => DraftPhoto[])) => void;
  updatePhoto: (id: string, patch: Partial<DraftPhoto>) => void;
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
  price: null,
  maxAttendees: null,
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
  setPrice: (price) => set({ price }),
  setMaxAttendees: (maxAttendees) => set({ maxAttendees }),
  setPhotos: (updater) =>
    set({ photos: typeof updater === "function" ? updater(get().photos) : updater }),
  updatePhoto: (id, patch) =>
    set((state) => ({
      photos: state.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
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
      price: null,
      maxAttendees: null,
      photos: [],
      layers: [],
      groups: [],
    });
  },
}));
