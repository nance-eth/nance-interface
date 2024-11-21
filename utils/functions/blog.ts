import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";

export type Post = {
  slug: string;
  title: string;
  date: string;
  body: string;
  author?: string;
};

const postsDirectory = path.join(process.cwd(), "pages/blog/posts");

export function getAllPostSlugs() {
  const files = fs.readdirSync(postsDirectory);
  return files.filter(file => file.endsWith(".md"))
    .map(file => file.replace(".md", ""));
}

export function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterRead = matter(fileContents);
  const body = matterRead.content;
  const metadata = matterRead.data;

  return {
    ...metadata,
    slug,
    body
  } as unknown as Post;
}

export function getAllPosts() {
  const slugs = getAllPostSlugs();
  const posts = slugs.map(slug => getPostBySlug(slug));

  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
