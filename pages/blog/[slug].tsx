import { Post, getAllPostSlugs, getPostBySlug } from "@/utils/functions/blog";
import { Footer, SiteNav } from "@/components/Site";
import { format } from "date-fns";
import { MarkdownViewer } from "@/components/Markdown";

export default function BlogPost({ post }: { post: Post }) {
  const {
    title,
    date,
    body,
  } = post;

  return (
    <>
      <SiteNav
        pageTitle={post.title}
        description="A blog by the Nance folks"
        withProposalButton={false}
      />
      <div className="my-12 max-w-3xl mx-auto py-8 px-14 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-gray-400">{
            format(new Date(post.date), "MMMM dd, yyyy")
          }</div>
          <h2 className="text-4xl text-center font-semibold mb-8">
            {post.title}
          </h2>
        </div>
        <MarkdownViewer body={post.body} />
      </div>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  const slugs = getAllPostSlugs();

  return {
    paths: slugs.map(slug => ({
      params: { slug }
    })),
    fallback: false
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  return {
    props: {
      post
    }
  };
}
