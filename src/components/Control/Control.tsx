import type { Editor } from "@tiptap/core";
import type { JSX } from "solid-js";
import { createEditorTransaction } from "solid-tiptap";

interface ControlProps {
  class: string;
  editor: Editor;
  title: string;
  key: string;
  onChange: () => void;
  isActive?: (editor: Editor) => boolean;
  children: JSX.Element;
}

export default function Control(props: ControlProps): JSX.Element {
  const flag = createEditorTransaction(
    () => props.editor,
    (instance) => {
      if (props.isActive) {
        return props.isActive(instance);
      }
      return instance.isActive(props.key);
    }
  );

  return (
    <div>
      <button
        type="button"
        class="btn btn-sm"
        classList={{ "btn-active": flag() }}
        onClick={props.onChange}
      >
        {props.children}
      </button>
    </div>
  );
}
