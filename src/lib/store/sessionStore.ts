"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, SelectedLocation, SessionUser } from "../types";
import { DEFAULT_LOCATION } from "../data/cities";

interface SessionState {
  user: SessionUser | null;
  location: SelectedLocation;
  cart: CartItem[];
  /** Set when a guest tries to check out, so login can bounce back. */
  redirectAfterLogin: string | null;
  setUser: (user: SessionUser | null) => void;
  setLocation: (location: SelectedLocation) => void;
  addToCart: (listingId: string, quantity?: number) => void;
  setCartQuantity: (listingId: string, quantity: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  setRedirectAfterLogin: (path: string | null) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      location: DEFAULT_LOCATION,
      cart: [],
      redirectAfterLogin: null,
      setUser: (user) => set({ user }),
      setLocation: (location) => set({ location }),
      addToCart: (listingId, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find((i) => i.listingId === listingId);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.listingId === listingId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { cart: [...state.cart, { listingId, quantity }] };
        }),
      setCartQuantity: (listingId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((i) => i.listingId !== listingId)
              : state.cart.map((i) => (i.listingId === listingId ? { ...i, quantity } : i)),
        })),
      removeFromCart: (listingId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.listingId !== listingId) })),
      clearCart: () => set({ cart: [] }),
      setRedirectAfterLogin: (redirectAfterLogin) => set({ redirectAfterLogin }),
    }),
    {
      name: "derigs.session.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
