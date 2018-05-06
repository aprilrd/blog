import React from "react";
import PropTypes from "prop-types";

// Utilities
import kebabCase from "lodash/kebabCase";

// Components
import Helmet from "react-helmet";
import Link from "gatsby-link";

const DailyReadingsPage = ({
  data: {
    site: {
      siteMetadata: { title },
    },
  },
}) => (
  <div>
    <Helmet title={title} />
    <div>
      I try to read something meaningful about management, tech, and Javascript
      every day since February 2017. This{" "}
      <a href="https://docs.google.com/spreadsheets/d/1I6E-u3rrMDhuCsilR_cM5igO8c2bMePBdoi-ke8UimY/edit?usp=sharing">
        google sheet
      </a>{" "}
      is the collection of my readings thus far.
      <iframe
        style={{
          width: "100%",
          height: "100vh",
        }}
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSa2RbC2Fo-ZC9ePnllxMNNGhGGdprve4x7uogrQlkPX_yMROmp_AIOxNT1XSE4UJpjAZ1mM60tBBPh/pubhtml?gid=0&amp;single=true&amp;widget=true&amp;headers=false"
      />
    </div>
  </div>
);

export default DailyReadingsPage;

export const pageQuery = graphql`
  query DailyReadingsQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
