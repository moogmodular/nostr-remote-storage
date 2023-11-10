"use client";

import React, { useEffect, useState } from "react";
import { useNDKStore } from "~/store/ndk-store";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { format } from "date-fns";
import { valueByTagName } from "~/utils/event-helpers";
import Link from "next/link";

export const TodoList = () => {
  const { ndk } = useNDKStore();

  const [todos, setTodos] = useState<NDKEvent[]>([]);

  useEffect(() => {
    setTodos([]);
    const sub = ndk?.subscribe({
      kinds: [NDKKind.Article],
      "#t": ["oftodo"],
      // deleted: ["false"],
    });

    sub?.on("event", (event) => {
      console.log(event);
      setTodos((prevTodos) => [...prevTodos, event]);
    });

    return () => {
      if (sub) sub.stop();
    };
  }, [ndk]);

  return (
    <div className={"flex flex-col gap-2"}>
      {todos
        .reduce((acc, cur) => {
          const existing = acc.find(
            (todo) =>
              valueByTagName(todo.tags, "d") === valueByTagName(cur.tags, "d"),
          );
          if (existing?.created_at && cur?.created_at) {
            // Assuming there is a timestamp property to compare which one is newer
            if (existing.created_at < cur.created_at) {
              // Replace with the newer entry
              const existingIndex = acc.indexOf(existing);
              acc[existingIndex] = cur;
            }
          } else {
            // If it's a new id, add the todo to the accumulator
            acc.push(cur);
          }
          return acc;
        }, [] as NDKEvent[])
        .filter((todo) => valueByTagName(todo.tags, "deleted") !== "true")
        .sort(
          (a, b) =>
            parseInt(valueByTagName(b.tags, "published_at") ?? "0") -
            parseInt(valueByTagName(a.tags, "published_at") ?? "0"),
        )
        .map((todo) => {
          const naddr = nip19.naddrEncode({
            pubkey: todo.pubkey,
            kind: todo.kind ?? NDKKind.Article,
            identifier: valueByTagName(todo.tags, "d") ?? "",
          });
          const link = `/todo/${naddr}`;
          return (
            <Card key={todo.id}>
              <CardHeader>
                <CardTitle>{valueByTagName(todo.tags, "title")}</CardTitle>
                <CardDescription
                  className={"flex flex-row justify-between"}
                ></CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={
                    "mb-4 flex flex-row justify-between text-sm text-gray-400"
                  }
                >
                  <p>due date: {valueByTagName(todo.tags, "dueDate")}</p>
                  <p>urgency: {valueByTagName(todo.tags, "urgency")}</p>
                  <p>status: {valueByTagName(todo.tags, "status")}</p>
                </div>
                <p>{todo.content}</p>
              </CardContent>
              <CardFooter className={"flex flex-col items-start"}>
                <p>
                  published:{" "}
                  {format(
                    ((parseInt(
                      valueByTagName(todo.tags, "published_at") ?? "0",
                    ) * 1000) as unknown as Date) ?? new Date(),
                    "PPP",
                  )}
                </p>
                <Link
                  className={"text-sm"}
                  href={link}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Address:{" "}
                  {nip19.naddrEncode({
                    pubkey: todo.pubkey,
                    kind: todo.kind ?? NDKKind.Article,
                    identifier: valueByTagName(todo.tags, "d") ?? "",
                  })}
                </Link>
              </CardFooter>
            </Card>
          );
        })}
    </div>
  );
};
