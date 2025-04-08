import { createSignal, Show } from "solid-js";
import StarterKit from "@tiptap/starter-kit";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import Layout from "~/components/Layouts/Layout";
import { createTiptapEditor } from "solid-tiptap";
import Toolbar from "~/components/Toolbar/Toolbar";

export default function Home() {
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const [menu, setMenu] = createSignal<HTMLDivElement>();

  const editor = createTiptapEditor(() => ({
    element: container()!,

    extensions: [
      StarterKit,
      BubbleMenu.configure({
        element: menu()!,
        tippyOptions: {
          maxWidth: "fit-content",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose max-w-full h-full",
      },
    },
    content: "<p>Example Text</p>",
  }));

  return (
    <Layout>
      <form class="w-full flex flex-col gap-5">
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">제목</legend>
          <input type="text" class="input w-full" placeholder="무제" />
        </fieldset>
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">설명</legend>
          <textarea class="textarea w-full" placeholder="설명" />
        </fieldset>
        <div ref={setMenu} class="rounded-lg overflow-hidden">
          <Show when={editor()}>
            {(editorInstance) => <Toolbar editor={editorInstance()} />}
          </Show>
        </div>
        <div class="h-80" ref={setContainer} />
        <div>
          <button type="submit" class="btn">
            SUBMIT
          </button>
        </div>
      </form>
    </Layout>
  );
}
