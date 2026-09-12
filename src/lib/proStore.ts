/**
 * proStore.ts
 * Global state management for GeetHub Pro subscriptions and feature access.
 */

import { create } from 'zustand';

interface ProState {
  isPro: boolean;
  proModalOpen: boolean;
  proFeatureRequested: string | null;
  setPro: (status: boolean) => void;
  openProModal: (featureName?: string) => void;
  closeProModal: () => void;
  togglePro: () => void;
}

export const useProStore = create<ProState>((set) => ({
  isPro: typeof window !== 'undefined' ? localStorage.getItem('geethub_pro') === 'true' : false,
  proModalOpen: false,
  proFeatureRequested: null,

  setPro: (status: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('geethub_pro', status ? 'true' : 'false');
    }
    set({ isPro: status });
  },

  openProModal: (featureName?: string) => {
    set({ proModalOpen: true, proFeatureRequested: featureName || null });
  },

  closeProModal: () => {
    set({ proModalOpen: false, proFeatureRequested: null });
  },

  togglePro: () => {
    set((state) => {
      const next = !state.isPro;
      if (typeof window !== 'undefined') {
        localStorage.setItem('geethub_pro', next ? 'true' : 'false');
      }
      return { isPro: next };
    });
  },
}));
