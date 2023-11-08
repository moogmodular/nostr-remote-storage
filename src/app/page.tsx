import { CreateKeyPair } from "~/components/create-key-pair";
import { CreateTodo } from "~/components/create-todo";
import { DebugBar } from "~/components/debug-bar";

export default async function Home() {
  return (
    <>
      <header>
        <DebugBar />
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center gap-8">
        <CreateKeyPair />
        <CreateTodo />
      </main>
    </>
  );
}
