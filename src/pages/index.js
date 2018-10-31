import React from "react";
import { graphql } from "gatsby";
import PostLink from "../components/postLink";
import Layout from "../components/layout";

const IndexPage = props => {
  const {
    data: {
      allMarkdownRemark: { edges },
    },
  } = props;
  const Posts = edges
    .filter(edge => !!edge.node.frontmatter.createdAt) // You can filter your posts based on some criteria
    .map(edge => <PostLink key={edge.node.id} post={edge.node} />);

  return (
    <Layout location={props.location}>
      <div>{Posts}</div>
    </Layout>
  );
};

export default IndexPage;

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___createdAt] }
    ) {
      edges {
        node {
          id
          excerpt(pruneLength: 100)
          frontmatter {
            createdAt(formatString: "MMMM DD, YYYY")
            tags
            path
            title
          }
        }
      }
    }
  }
`;
