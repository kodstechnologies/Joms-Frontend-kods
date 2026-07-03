import { create } from "zustand";
import { persist } from "zustand/middleware";

import { venueDummyData } from "../components/category/venue-dummy-data";
import type { VenueCategory } from "../components/category/venue-category-table-columns";

interface VenueCategoryStore {
    categories: VenueCategory[];

    createCategory: (category: VenueCategory) => void;

    updateCategory: (category: VenueCategory) => void;

    pauseCategory: (id: string) => void;

    resumeCategory: (id: string) => void;

    removeCategory: (id: string) => void;

    revokeCategory: (id: string) => void;
}

export const useVenueCategoryStore =
    create<VenueCategoryStore>()(
        persist(
            (set) => ({
                categories: venueDummyData,

                createCategory: (category) =>
                    set((state) => ({
                        categories: [
                            ...state.categories,
                            category,
                        ],
                    })),

                updateCategory: (updatedCategory) =>
                    set((state) => ({
                        categories: state.categories.map(
                            (category) =>
                                category.id ===
                                updatedCategory.id
                                    ? updatedCategory
                                    : category
                        ),
                    })),

                pauseCategory: (id) =>
                    set((state) => ({
                        categories: state.categories.map(
                            (item) =>
                                item.id === id
                                    ? {
                                          ...item,
                                          previousStatus:
                                              item.status,
                                          status: "Paused",
                                      }
                                    : item
                        ),
                    })),

                resumeCategory: (id) =>
                    set((state) => ({
                        categories: state.categories.map(
                            (item) =>
                                item.id === id
                                    ? {
                                          ...item,
                                          status:
                                              item.previousStatus ??
                                              "Accepted",
                                          previousStatus:
                                              undefined,
                                      }
                                    : item
                        ),
                    })),

                removeCategory: (id) =>
                    set((state) => ({
                        categories: state.categories.map(
                            (item) =>
                                item.id === id
                                    ? {
                                          ...item,
                                          previousStatus:
                                              item.status,
                                          status: "Deleted",
                                      }
                                    : item
                        ),
                    })),

                revokeCategory: (id) =>
                    set((state) => ({
                        categories: state.categories.map(
                            (item) =>
                                item.id === id
                                    ? {
                                          ...item,
                                          status:
                                              item.previousStatus ??
                                              "Accepted",
                                          previousStatus:
                                              undefined,
                                      }
                                    : item
                        ),
                    })),
            }),
            {
                name: "venue-category-storage-v4",
            }
        )
    );