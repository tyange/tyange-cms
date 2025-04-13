import { clientOnly } from "@solidjs/start";

import Layout from "~/components/Layouts/Layout";

const PostEditor = clientOnly(
  () => import("~/components/PostEditor/PostEditor")
);

export default function Home() {
  return (
    <Layout>
      <PostEditor />
    </Layout>
  );
}
