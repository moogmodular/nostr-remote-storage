import { CreateKeyPair } from "~/components/create-key-pair";
import { CreateTodo } from "~/components/create-todo";
import { DebugBar } from "~/components/debug-bar";
import { TodoList } from "~/components/todo-list";

export default async function Home() {
  return (
    <>
      <header className={"flex flex-col gap-4 bg-gray-50 p-4"}>
        <DebugBar />
        <CreateKeyPair />
      </header>

      <main className="flex flex-row items-start justify-start gap-8 p-6">
        <TodoList />
        <CreateTodo />
      </main>
    </>
  );
}
