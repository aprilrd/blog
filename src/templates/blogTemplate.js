import React from "react";
import { graphql } from "gatsby";

import SEO from "../components/SEO";
import Layout from "../components/layout";

function BlogTemplate(props) {
  const {
    data, // this prop will be injected by the GraphQL query below.
  } = props;
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { frontmatter, html } = markdownRemark;
  return (
    <Layout location={props.location}>
      <div className="blog-post-container">
        <SEO isBlogPost postData={frontmatter} />
        <div className="blog-post">
          <h1>{frontmatter.title}</h1>
          <h2>{frontmatter.createdAt}</h2>
          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </Layout>
  );
}

export default BlogTemplate;

export const pageQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        createdAt(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
  }
`;
