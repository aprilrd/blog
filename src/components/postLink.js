import React from "react";
import Link from "gatsby-link";

const PostLink = ({ post }) => (
  <div>
    <Link to={post.frontmatter.path}>
      {post.frontmatter.title} ({post.frontmatter.createdAt}) |{" "}
      {post.frontmatter.tags.map(tag => `#${tag}`).join(", ")}
    </Link>
    <blockquote>{post.excerpt}</blockquote>
  </div>
);

export default PostLink;
