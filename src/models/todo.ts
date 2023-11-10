import { z } from "zod";

export const createTodoSchema = z.object({
  todoTitle: z.string().min(1),
  todoContent: z.string().min(1),
  dueDate: z.date().min(new Date()),
  urgency: z.enum(["low", "medium", "high"]).default("low"),
});

export const persistedTodoSchema = createTodoSchema.extend({
  status: z.enum(["todo", "done", "in-progress"]),
  published_at: z.date(),
  d: z.date(),
});

export const editTodoSchema = createTodoSchema.extend({
  status: z.enum(["todo", "done", "in-progress"]),
  deleted: z.boolean().default(false),
});

export type CreateTodoFormValues = z.infer<typeof createTodoSchema>;
export type PersistedTodoFormValues = z.infer<typeof persistedTodoSchema>;
export type EditTodoFormValues = z.infer<typeof editTodoSchema>;
