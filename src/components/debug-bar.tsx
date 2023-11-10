"use client";

import { Button } from "./ui/button";
import { useNDKStore } from "~/store/ndk-store";
import { useEffect, useState } from "react";

export const DebugBar = () => {
  const { ndk, initAnonymous } = useNDKStore();
  const [currentPublicKey, setCurrentPublicKey] =
    useState<string>("No pubkey / No ndk");

  useEffect(() => {
    initAnonymous();
  }, []);

  useEffect(() => {
    const publicKeyFromNDK = ndk?.activeUser?.pubkey;
    if (publicKeyFromNDK) {
      setCurrentPublicKey(publicKeyFromNDK);
    } else {
      if (ndk) {
        setCurrentPublicKey("connected to ndk without signer");
      } else {
        setCurrentPublicKey("No pubkey / No ndk");
      }
    }
  }, [ndk]);

  const hello = () => {
    console.log(ndk);
  };

  return (
    <div className={"flex flex-row items-center justify-between"}>
      <div>Connected with pubkey: {currentPublicKey}</div>
      <Button onClick={hello}>Seed Events</Button>
    </div>
  );
};
