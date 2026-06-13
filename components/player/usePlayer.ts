import { create } from "zustand";

export type QueueItem = {
  id: string;
  title: string;
  artist: string;
  streamHref: string;
  artworkUrl?: string | null;
  platform?: string;
};

type State = {
  queue: QueueItem[];
  index: number;
  playing: boolean;
  expanded: boolean;
  currentTime: number;
  duration: number;
  setQueue: (q: QueueItem[], startAt?: number) => void;
  play: (i?: number) => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  toggleExpanded: () => void;
  setExpanded: (v: boolean) => void;
  setProgress: (currentTime: number, duration: number) => void;
};

export const usePlayer = create<State>((set, get) => ({
  queue: [],
  index: -1,
  playing: false,
  expanded: false,
  currentTime: 0,
  duration: 0,

  setQueue: (q, startAt = 0) =>
    set({ queue: q, index: q.length ? startAt : -1, playing: !!q.length }),

  play: (i) => {
    if (typeof i === "number") set({ index: i, playing: true });
    else set({ playing: true });
  },

  pause: () => set({ playing: false }),

  next: () => {
    const { index, queue } = get();
    if (index < queue.length - 1) set({ index: index + 1, playing: true });
  },

  prev: () => {
    const { index } = get();
    if (index > 0) set({ index: index - 1, playing: true });
  },

  toggleExpanded: () => set((s) => ({ expanded: !s.expanded })),
  setExpanded: (v) => set({ expanded: v }),
  setProgress: (currentTime, duration) => set({ currentTime, duration }),
}));
