import { create } from "zustand";

interface OnlineUsersState {
  onlineUsers: Set<string>;
  lastActiveMap: Record<string, string>;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string, lastActive?: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
}

const useOnlineUsersStore = create<OnlineUsersState>((set) => ({
  onlineUsers: new Set<string>(),
  lastActiveMap: {},

  addOnlineUser: (userId: string) =>
    set((state) => {
      if (state.onlineUsers.has(userId)) return state;
      const next = new Set(state.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    }),

  removeOnlineUser: (userId: string, lastActive?: string) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return {
        onlineUsers: next,
        lastActiveMap: lastActive
          ? { ...state.lastActiveMap, [userId]: lastActive }
          : state.lastActiveMap,
      };
    }),

  setOnlineUsers: (userIds: string[]) =>
    set(() => ({
      onlineUsers: new Set(userIds),
    })),
}));

/** Check if a specific user is online */
export function useIsUserOnline(userId: string | undefined): boolean {
  return useOnlineUsersStore((s) =>
    userId ? s.onlineUsers.has(userId) : false,
  );
}

/** Get last active time for a user */
export function useLastActive(userId: string | undefined): string | null {
  return useOnlineUsersStore((s) =>
    userId ? (s.lastActiveMap[userId] ?? null) : null,
  );
}

export default useOnlineUsersStore;
