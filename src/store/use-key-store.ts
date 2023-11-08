import { create } from "zustand";
import { utils } from "@noble/secp256k1";
import { generatePrivateKey, getPublicKey, nip19 } from "nostr-tools";
import { useNDKStore } from "~/store/ndk-store";

interface NostrKeyState {
  privateKey: string | undefined;
  publicKey: string | undefined;
  nsec: string | undefined;
  npub: string | undefined;
  isKeyPairValid: boolean;
  generateKeyPair: () => void;
  setKeyPair: (privateKey: string) => void;
}

export const useKeyStore = create<NostrKeyState>()((set, get, store) => ({
  privateKey: undefined,
  publicKey: undefined,
  nsec: undefined,
  npub: undefined,
  isKeyPairValid: false,
  generateKeyPair: () => {
    const privateKey = generatePrivateKey();
    get().setKeyPair(privateKey);
    useNDKStore.getState().init(privateKey);
  },
  setKeyPair: (privateKey) => {
    const isValid = utils.isValidPrivateKey(privateKey);
    if (isValid) {
      const publicKey = getPublicKey(privateKey);
      const nsec = nip19.nsecEncode(publicKey);
      const npub = nip19.npubEncode(publicKey);
      set({ privateKey, publicKey, nsec, npub, isKeyPairValid: true });
      useNDKStore.getState().init(privateKey);
    } else {
      console.error("Invalid private key");
      console.error("Invalid private key", store.getState());
      set({
        privateKey,
        publicKey: "...invalid private key",
        nsec: "",
        npub: "",
        isKeyPairValid: false,
      });
      useNDKStore.getState().disconnect();
    }
  },
}));
