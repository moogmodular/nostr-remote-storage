"use client";

import { useParams } from "next/navigation";
import { useNDKStore } from "~/store/ndk-store";
import { nip19 } from "nostr-tools";
import React, { useEffect, useState } from "react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { valueByTagName } from "~/utils/event-helpers";
import { format } from "date-fns";
import { AddressPointer } from "nostr-tools/lib/types/nip19";
import { Button } from "~/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { EditTodoFormValues, editTodoSchema } from "~/models/todo";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import { Separator } from "~/components/ui/separator";
import { CreateKeyPair } from "~/components/create-key-pair";
import { DebugBar } from "~/components/debug-bar";
import { useKeyStore } from "~/store/use-key-store";

export default function Todo() {
  const { ndk, initAnonymous } = useNDKStore();
  const { publicKey } = useKeyStore();

  const [thisTodo, setThisTodo] = useState<NDKEvent | undefined>();
  const [thisTodoHistory, setThisTodoHistory] = useState<NDKEvent[]>([]);
  const [subsctiption, setSubscription] = useState<any>(null);

  const params: { id: string } | null = useParams<{ id: string }>();
  const naddrDecodeRes = nip19.decode(params?.id ?? "");
  const naddrData = naddrDecodeRes?.data as AddressPointer;

  const form = useForm<EditTodoFormValues>({
    resolver: zodResolver(editTodoSchema),
    defaultValues: {
      todoTitle: "",
      todoContent: "",
      dueDate: new Date(),
      urgency: "low",
      status: "todo",
    },
  });

  useEffect(() => {
    setThisTodoHistory([]);
    const sub = ndk?.subscribe({
      kinds: [NDKKind.Article],
      authors: [naddrData?.pubkey ?? ""],
      "#d": [naddrData.identifier],
      "#t": ["oftodo"],
    });

    console.log("sub", sub);

    sub?.on("event", (event) => {
      console.log(event);
      setThisTodoHistory((prev) => [...prev, event]);
      form.reset({
        todoTitle: valueByTagName(event.tags, "title"),
        todoContent: event.content,
        dueDate: new Date(valueByTagName(event.tags, "dueDate") as string),
        urgency: valueByTagName(event.tags, "urgency") as
          | "low"
          | "medium"
          | "high"
          | undefined,
        status: valueByTagName(event.tags, "status") as
          | "todo"
          | "done"
          | "in-progress"
          | undefined,
      });
    });
    return () => {
      if (sub) sub.stop();
    };
  }, [ndk]);

  useEffect(() => {
    const lastTodo = thisTodoHistory[thisTodoHistory.length - 1];

    if (thisTodoHistory[thisTodoHistory.length - 1]) {
      setThisTodo(thisTodoHistory[thisTodoHistory.length - 1]);
    }
  }, [thisTodoHistory]);

  const handleUpdateTodo: SubmitHandler<EditTodoFormValues> = async (data) => {
    if (!ndk) return;
    const newTodoEvent = new NDKEvent(ndk, {
      kind: NDKKind.Article,
      pubkey: naddrData?.pubkey ?? "",
      content: data.todoContent,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["title", data.todoTitle],
        ["description", data.todoContent],
        ["dueDate", data.dueDate.toISOString()],
        ["urgency", data.urgency],
        ["published_at", `${Math.floor(Date.now() / 1000)}`],
        ["status", `${data.status}`],
        ["d", `${naddrData?.identifier}`],
        ["t", "oftodo"],
      ],
    });

    await newTodoEvent.publish().then((res) => {
      console.log("DONE", res);
    });
  };

  const handleDeleteTodo = async () => {
    if (!ndk) return;
    const newTodoEvent = new NDKEvent(ndk, {
      kind: NDKKind.Article,
      pubkey: naddrData?.pubkey ?? "",
      content: "",
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["title", form.getValues("todoTitle")],
        ["description", form.getValues("todoContent")],
        ["dueDate", form.getValues("dueDate").toISOString()],
        ["urgency", form.getValues("urgency")],
        ["published_at", `${Math.floor(Date.now() / 1000)}`],
        ["status", `${form.getValues("status")}`],
        ["d", `${naddrData?.identifier}`],
        ["t", "oftodo"],
        ["deleted", "true"],
      ],
    });

    await newTodoEvent.publish().then((res) => {
      console.log("DONE", res);
    });
  };

  return (
    <>
      <div>
        <DebugBar />
        <CreateKeyPair />
      </div>
      {thisTodo && (
        <div className={"p-4"}>
          <Card key={thisTodo.id}>
            <CardHeader>
              <CardTitle>{valueByTagName(thisTodo.tags, "title")}</CardTitle>
              <CardDescription className={"flex flex-row justify-between"}>
                <div>due date: {valueByTagName(thisTodo.tags, "dueDate")}</div>
                <div>urgency: {valueByTagName(thisTodo.tags, "urgency")}</div>
                <div>status: {valueByTagName(thisTodo.tags, "status")}</div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleUpdateTodo)}
                  className={"flex flex-col gap-4"}
                >
                  <FormField
                    control={form.control}
                    name="todoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="...todo title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="todoContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Todo content</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Todo urgency</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Urgency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Todo due date</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[280px] justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {publicKey === naddrData?.pubkey && (
                    <Button type={"submit"}>Update Todo</Button>
                  )}
                </form>
              </Form>
            </CardContent>
            <CardFooter className={"flex flex-col items-start gap-4"}>
              <p>
                published:{" "}
                {format(
                  ((parseInt(
                    valueByTagName(thisTodo.tags, "published_at") ?? "0",
                  ) * 1000) as unknown as Date) ?? new Date(),
                  "PPP",
                )}
              </p>
              {publicKey === naddrData?.pubkey && (
                <Button variant={"outline"} onClick={handleDeleteTodo}>
                  Delete Todo
                </Button>
              )}
            </CardFooter>
          </Card>
          {thisTodoHistory.length > 1 && (
            <div>
              <h3>history</h3>
              {thisTodoHistory.map((todo) => {
                return (
                  <div className={"text-sm text-gray-400"}>
                    <Separator />
                    <div>{todo.content}</div>
                    <div>{valueByTagName(todo.tags, "title")}</div>
                    <div>{valueByTagName(todo.tags, "urgency")}</div>
                    <div>{valueByTagName(todo.tags, "deleted")}</div>
                    <div>{valueByTagName(todo.tags, "status")}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
