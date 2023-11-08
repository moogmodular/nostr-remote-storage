"use client";

import React from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "./ui/label";
import { useKeyStore } from "~/store/use-key-store";

export const CreateKeyPair = () => {
  const { privateKey, publicKey, setKeyPair, generateKeyPair, isKeyPairValid } =
    useKeyStore();

  return (
    <div className={"flex w-3/5 flex-col gap-2"}>
      <div className={"flex items-center space-x-2"}>
        <Label className={"w-32"} htmlFor="private-key">
          Private Key
        </Label>
        <Input
          id="private-key"
          value={privateKey}
          onChange={(e) => setKeyPair(e.target.value)}
          className={isKeyPairValid ? undefined : "border-red-500"}
        />
        <Button onClick={generateKeyPair}>Generate Key Pair</Button>
      </div>
      <div className={"flex items-center space-x-2"}>
        <Label className={"w-32"} htmlFor="public-key">
          Public Key
        </Label>
        <Input id="public-key" value={publicKey} disabled={true} />
      </div>
    </div>
  );
};
