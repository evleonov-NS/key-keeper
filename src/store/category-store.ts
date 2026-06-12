import { create } from 'zustand'
import type { Category } from '../types/category'
import { generateId } from '../utils/id'
import { useLicenseStore } from './license-store'

type CategoryStore = {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (name: string, isDemo?: boolean) => Category
  updateCategory: (id: string, name: string) => void
  removeCategory: (id: string) => void
  clearDemoCategories: () => void
  hasDemoCategories: () => boolean
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],

  setCategories: (categories) => set({ categories }),

  addCategory: (name, isDemo = false) => {
    const category: Category = { id: generateId(), name: name.trim(), isDemo }
    set((state) => ({ categories: [...state.categories, category] }))
    return category
  },

  updateCategory: (id, name) => {
    const trimmed = name.trim()
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? { ...category, name: trimmed } : category,
      ),
    }))
  },

  removeCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    }))

    // При удалении категории — отвязка у лицензий (логика Этапа 4, заложена заранее)
    const licenses = useLicenseStore.getState().licenses
    useLicenseStore.getState().setLicenses(
      licenses.map((license) =>
        license.category === id ? { ...license, category: null } : license,
      ),
    )
  },

  clearDemoCategories: () => {
    const demoIds = new Set(
      get()
        .categories.filter((category) => category.isDemo)
        .map((category) => category.id),
    )

    set((state) => ({
      categories: state.categories.filter((category) => !category.isDemo),
    }))

    const licenses = useLicenseStore.getState().licenses
    useLicenseStore.getState().setLicenses(
      licenses.map((license) =>
        license.category && demoIds.has(license.category)
          ? { ...license, category: null }
          : license,
      ),
    )
  },

  hasDemoCategories: () => get().categories.some((category) => category.isDemo),
}))
