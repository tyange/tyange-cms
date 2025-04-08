import type { ParentProps } from "solid-js";

export default function Layout(props: ParentProps) {
  return (
    <div class="font-pretendard">
      <main>
        <div class="p-10 w-3xl">{props.children}</div>
      </main>
    </div>
  );
}
