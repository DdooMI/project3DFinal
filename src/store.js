import { create } from "zustand";

const useStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => {
    if (state.items.length > 50) return state; // Prevent too many objects
    return { items: [...state.items, item] };
  })
}));

export default useStore;
