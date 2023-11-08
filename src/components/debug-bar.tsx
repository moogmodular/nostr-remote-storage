"use client";

import { Button } from "./ui/button";
import { useNDKStore } from "~/store/ndk-store";
import { useEffect, useState } from "react";

export const DebugBar = () => {
  const { ndk } = useNDKStore();
  const [currentPublicKey, setCurrentPublicKey] =
    useState<string>("No pubkey / No ndk");

  useEffect(() => {
    const publicKeyFromNDK = ndk?.activeUser?.pubkey;
    if (publicKeyFromNDK) {
      setCurrentPublicKey(publicKeyFromNDK);
    } else {
      setCurrentPublicKey("No pubkey / No ndk");
    }
  }, [ndk]);

  const hello = () => {
    console.log(ndk);
  };

  return (
    <div className={"flex flex-row items-center justify-between p-4"}>
      <div>Connected with pubkey: {currentPublicKey}</div>
      <Button onClick={hello}>Seed Events</Button>
    </div>
  );
};
