import { create } from 'zustand'

type SearchStore = {
  query: string
  setQuery: (query: string) => void
  clearQuery: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  clearQuery: () => set({ query: '' }),
}))
