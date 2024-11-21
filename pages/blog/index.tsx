import { Footer, SiteNav } from "@/components/Site";
import { getAllPosts, Post } from "@/utils/functions/blog";
import { format } from "date-fns";

export default function NanceBlog({ posts }: { posts: Post[] }) {
  return (
    <>
      <SiteNav
        pageTitle="Blog"
        description="A blog by the Nance folks"
        withProposalButton={false}
      />
      <div className="justify-center items-center text-center">

        {/* Tag line */}
        <div className="my-12">
          <p className="text-sm italic text-slate-400 mt-1 whitespace-pre-line">
            some thoughts on human organization,{"\n"}
            governing, and whatever else we feel like
          </p>
        </div>

        {/* Post card */}
        <div className="flex flex-col space-y-8 max-w-2xl mx-auto">
          {posts?.map((post) => (
            <a href={`/blog/${post.slug}`} key={post.slug}>
              <article className="px-6 py-8 bg-white rounded-lg border border-gray-200 hover:border-gray-900">
                <div className="text-center">
                  <div className="text-gray-400">{
                    format(new Date(post.date), "MMMM dd, yyyy")
                  }</div>
                  <h2 className="text-2xl font-semibold">
                    {post.title}
                  </h2>
                  <p className="mt-4 px-4 text-gray-600 text-left">{post.body.substring(0,200)}...</p>
                  <span className="inline-block px-3 py-1 mt-4 text-sm text-gray-600 border rounded-full">
                    Read more
                  </span>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export async function getStaticProps() {
  const posts = getAllPosts();
  return {
    props: {
      posts,
    },
  };
}
