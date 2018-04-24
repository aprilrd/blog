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
        <link rel="canonical" href={`${config.url}${location.pathname}`} />
      </Helmet>
      <Header />
      <div
        style={{
          margin: "0 auto",
          maxWidth: 960,
          padding: "0px 1.0875rem 1.45rem",
          paddingTop: 0,
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
