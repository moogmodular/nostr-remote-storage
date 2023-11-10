import { NDKTag } from "@nostr-dev-kit/ndk";

export const valueByTagName = (tags: NDKTag[], tagName: string) => {
  const tag = tags.find((tag) => tag[0] === tagName);
  return tag ? tag[1] : undefined;
};
