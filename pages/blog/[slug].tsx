import { Post, getAllPostSlugs, getPostBySlug } from "@/utils/functions/blog";
import { Footer, SiteNav } from "@/components/Site";
import { format } from "date-fns";
import { MarkdownViewer } from "@/components/Markdown";
import Link from "next/link";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";

export default function BlogPost({ post }: { post: Post }) {
  return (
    <>
      <SiteNav
        pageTitle={post.title}
        description="A blog by the Nance folks"
        withProposalButton={false}
      />
      <div className="my-12 px-4 sm:px-14">
        <div className="max-w-3xl mx-auto mb-2">
          <Link
            href="/blog"
            className="text-sm flex flex-row"
          >
            <ArrowLongLeftIcon className="h-5 w-5" /> &nbsp; back
          </Link>
        </div>
        <div className="max-w-3xl mx-auto py-8 px-6 sm:px-14 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="text-gray-400">{
              format(new Date(post.date), "MMMM dd, yyyy")
            }</div>
            <h2 className="text-3xl sm:text-4xl text-center font-semibold mb-8">
              {post.title}
            </h2>
          </div>
          <MarkdownViewer body={post.body} />
        </div>
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
