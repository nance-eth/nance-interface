import { SiteNav } from "@/components/Site";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function getStaticProps(context: any) {
  // fetch markdown from git raw
  const res = await fetch(
    "https://raw.githubusercontent.com/jbx-protocol/juice-docs/refs/heads/master/docs/dao/process.md"
  );
  const markdown = await res.text();

  return {
    props: {
      markdown,
    }, // will be passed to the page component as props
  };
}

export default function ProcessPage({ markdown }: { markdown: string }) {
  return (
    <>
      <SiteNav
        pageTitle={"Governance Process"}
        description="Governance Process of JuiceboxDAO"
        image="/images/unsplash_voting.jpeg"
      />

      <div className="flex min-h-full justify-center">
        <main className="py-10">
          <article className="prose prose-lg prose-indigo mx-auto mt-6 break-words text-gray-500">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>
        </main>
      </div>
    </>
  );
}
