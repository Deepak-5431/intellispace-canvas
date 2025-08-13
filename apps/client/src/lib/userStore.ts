import { create } from 'zustand';
import { account } from './appwrite';
import { Models } from 'appwrite';

// This interface defines the "shape" of our store
interface UserState {
  currentUser: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUser: async () => {
    try {
      const user = await account.get();
      set({ currentUser: user, isLoading: false });
    } catch (error) {
      set({ currentUser: null, isLoading: false });
    }
  },
}));