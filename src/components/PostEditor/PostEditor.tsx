import { createSignal, For, Index, Show } from "solid-js";
import ky from "ky";
import { createTiptapEditor } from "solid-tiptap";
import StarterKit from "@tiptap/starter-kit";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import "cally";
import { format } from "date-fns";
import { X } from "lucide-solid";
import Toolbar from "../Toolbar/Toolbar";

export default function PostEditor() {
  const [container, setContainer] = createSignal<HTMLDivElement>();
  const [menu, setMenu] = createSignal<HTMLDivElement>();
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [publishedAt, setPublishedAt] = createSignal(
    format(new Date(), "yyyy-MM-dd")
  );
  const [tags, setTags] = createSignal<string[]>([]);
  const [tagInput, setTagInput] = createSignal("");

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
          content: editor()?.getHTML() ?? "THIS IS TEST CONTENT",
          tags: tags().join(", "),
          published_at: publishedAt(),
        },
      });
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  }

  function handleTagKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && tagInput().trim() !== "") {
      e.preventDefault();
      setTags([...tags(), tagInput().trim()]);
      setTagInput("");
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags().filter((tag) => tag !== tagToRemove));
  }

  function forTest() {
    setTitle("THIS IS TITLE");
    setDescription("THIS IS DESC");
    setTags(["TEST_TAG"]);
  }

  return (
    <>
      <button type="button" onClick={forTest}>
        FOR TEST
      </button>
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
            value={title()}
            onInput={(e) => setTitle(e.target.value)}
          />
        </fieldset>
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">설명</legend>
          <textarea
            class="textarea w-full"
            placeholder="설명"
            value={description()}
            onChange={(e) => setDescription(e.target.value)}
          />
        </fieldset>
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">작성한 날</legend>
          <input
            type="date"
            class="input w-full"
            value={publishedAt()}
            onInput={(e) => setPublishedAt(e.target.value)}
          />
        </fieldset>
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">문장들</legend>
          <div ref={setMenu} class="rounded-lg overflow-hidden">
            <Show when={editor()}>
              {(editorInstance) => <Toolbar editor={editorInstance()} />}
            </Show>
          </div>
          <div
            class="h-80 border border-base-content/20 rounded-sm p-5"
            ref={setContainer}
          />
        </fieldset>
        <fieldset class="fieldset w-full">
          <legend class="fieldset-legend">태그들</legend>
          <input
            type="text"
            class="input w-full"
            value={tagInput()}
            onInput={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Press Enter to add a tag"
          />
        </fieldset>
        <div class="flex flex-wrap gap-2">
          <Index each={tags()}>
            {(tag) => (
              <button
                type="button"
                class="btn"
                onClick={() => removeTag(tag())}
              >
                {tag()}
                <X class="w-4 h-4" />
              </button>
            )}
          </Index>
        </div>
        <div>
          <button type="button" class="btn" onClick={handleSubmit}>
            SUBMIT
          </button>
        </div>
      </form>
    </>
  );
}
