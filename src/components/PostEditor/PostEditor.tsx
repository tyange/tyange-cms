import { createSignal, Show } from "solid-js";
import ky from "ky";
import { createTiptapEditor } from "solid-tiptap";
import StarterKit from "@tiptap/starter-kit";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import "cally";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-solid";

import Toolbar from "../Toolbar/Toolbar";

export default function PostEditor() {
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const [menu, setMenu] = createSignal<HTMLDivElement>();
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [publishedAt, setPublishedAt] = createSignal(
    format(new Date(), "yyyy-MM-dd")
  );

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

  async function handleSubmit() {
    console.log(publishedAt());
    try {
      const res = await ky.post("http://localhost:4000/upload-post", {
        json: {
          title: title(),
          description: description(),
          content: editor()?.getHTML(),
        },
      });
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form
      class="w-full flex flex-col gap-5"
      onSubmit={(e) => e.preventDefault()}
    >
      <fieldset class="fieldset w-full">
        <legend class="fieldset-legend">제목</legend>
        <input
          type="text"
          class="input w-full"
          placeholder="무제"
          onInput={(e) => setTitle(e.target.value)}
        />
      </fieldset>
      <fieldset class="fieldset w-full">
        <legend class="fieldset-legend">설명</legend>
        <textarea
          class="textarea w-full"
          placeholder="설명"
          onChange={(e) => setDescription(e.target.value)}
        />
      </fieldset>
      <calendar-date
        value={publishedAt()}
        onChange={(e: Event) =>
          setPublishedAt((e.target as HTMLInputElement).value)
        }
      >
        <button
          type="button"
          slot="previous"
          class="btn btn-xs btn-circle btn-neutral"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          slot="next"
          class="btn btn-xs btn-circle btn-neutral"
        >
          <ChevronRight />
        </button>
        <calendar-month />
      </calendar-date>
      <div ref={setMenu} class="rounded-lg overflow-hidden">
        <Show when={editor()}>
          {(editorInstance) => <Toolbar editor={editorInstance()} />}
        </Show>
      </div>
      <div class="h-80" ref={setContainer} />
      <div>
        <button type="submit" class="btn" onClick={handleSubmit}>
          SUBMIT
        </button>
      </div>
    </form>
  );
}
