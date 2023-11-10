"use client";

import React, { useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useNDKStore } from "~/store/ndk-store";
import { useKeyStore } from "~/store/use-key-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { CreateTodoFormValues, createTodoSchema } from "~/models/todo";

export const CreateTodo = () => {
  const { ndk } = useNDKStore();
  const { publicKey } = useKeyStore();

  const form = useForm<CreateTodoFormValues>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      todoTitle: "",
      todoContent: "",
      dueDate: new Date(),
      urgency: "low",
    },
  });

  const handleCreateTodo: SubmitHandler<CreateTodoFormValues> = async (
    data,
  ) => {
    if (!ndk || !publicKey) return;
    const naaddr = nip19.naddrEncode({
      pubkey: publicKey,
      kind: NDKKind.Article,
      identifier: data.todoTitle,
    });

    const newTodoEvent = new NDKEvent(ndk, {
      kind: NDKKind.Article,
      pubkey: publicKey,
      content: data.todoContent,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["title", data.todoTitle],
        ["description", data.todoContent],
        ["dueDate", data.dueDate.toISOString()],
        ["urgency", data.urgency],
        ["published_at", `${Math.floor(Date.now() / 1000)}`],
        ["status", "todo"],
        ["d", `${Math.floor(Date.now() / 1000)}`],
        ["t", "oftodo"],
        ["deleted", "false"],
      ],
    });

    await newTodoEvent.publish().then((res) => {
      console.log(res);
    });
  };
  return (
    <div>
      <h2 className={"text-2xl font-bold"}>Create Todo</h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCreateTodo)}
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
                  <Select onValueChange={field.onChange}>
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
          <Button type={"submit"}>Submit Todo</Button>
        </form>
      </Form>
    </div>
  );
};
