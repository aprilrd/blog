import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";

import * as config from "../config";
import Header from "../components/Header";
import "./index.css";

const TemplateWrapper = ({ children, location }) => {
  return (
    <div>
      <Helmet
        defaultTitle={config.blogTitle}
        titleTemplate={`%s | ${config.blogTitle}`}
      >
        <meta name="og:type" content="website" />
        <meta name="og:site_name" content={config.blogTitle} />
        <meta
          name="google-site-verification"
          content="yhN3kUxRqwJLfzIfMTpAvB2avF8NGeCIT86wjtL5Lkk"
        />
        <link rel="canonical" href={`${config.url}${location.pathname}`} />
      </Helmet>
      <Header />
      <div
        style={{
          margin: "0 auto",
          maxWidth: "42rem",
          padding: "1.5rem 1.125rem",
        }}
      >
        {children()}
      </div>
    </div>
  );
};

TemplateWrapper.propTypes = {
  children: PropTypes.func,
};

export default TemplateWrapper;
