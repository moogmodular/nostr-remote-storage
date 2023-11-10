import { create } from "zustand";
import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { relayList } from "~/constants/relay-list";

interface NostrKeyState {
  ndk: NDK | undefined;
  init: (privateKey: string) => void;
  initAnonymous: () => void;
  disconnect: () => void;
}

export const useNDKStore = create<NostrKeyState>()((set, get, store) => ({
  ndk: undefined,
  init: async (privateKey) => {
    const ndk = new NDK({
      explicitRelayUrls: relayList,
      signer: new NDKPrivateKeySigner(privateKey),
    });
    await ndk.connect();
    set({ ndk });
  },
  initAnonymous: async () => {
    const ndk = new NDK({
      explicitRelayUrls: relayList,
    });
    await ndk.connect();
    set({ ndk });
  },
  disconnect: () => {
    set({ ndk: undefined });
  },
}));
