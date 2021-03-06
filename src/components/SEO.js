import path from "path";
import React from "react";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import * as config from "../config";

const getSchemaOrgJSONLD = ({
  isBlogPost,
  url,
  title,
  image,
  description,
  datePublished,
}) => {
  const schemaOrgJSONLD = [
    {
      "@context": "http://schema.org",
      "@type": "WebSite",
      url,
      name: title,
      alternateName: config.blogTitle,
    },
  ];

  return isBlogPost
    ? [
        ...schemaOrgJSONLD,
        {
          "@context": "http://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@id": url,
                name: title,
                image,
              },
            },
          ],
        },
        {
          "@context": "http://schema.org",
          "@type": "BlogPosting",
          url,
          name: title,
          alternateName: config.blogTitle,
          headline: title,
          image: {
            "@type": "ImageObject",
            url: image,
          },
          description,
          author: {
            "@type": "Person",
            name: config.authorName,
          },
          publisher: {
            "@type": "Organization",
            url: config.url,
            name: config.authorName,
          },
          mainEntityOfPage: {
            "@type": "WebSite",
            "@id": config.url,
          },
          datePublished,
        },
      ]
    : schemaOrgJSONLD;
};

const SEO = ({ postData, isBlogPost }) => {
  const postMeta = postData.frontmatter || {};

  const title = postMeta.title || config.blogTitle;
  // TODO: const description =
  //   postMeta.description || postData.excerpt || config.description;
  const description = undefined;
  // TODO: const image = `${config.url}${postImage}` || config.image;
  const image = undefined;
  const url = postMeta.slug
    ? `${config.url}${path.sep}${postMeta.slug}`
    : config.url;
  const datePublished = isBlogPost ? postMeta.createdAt : false;

  const schemaOrgJSONLD = getSchemaOrgJSONLD({
    isBlogPost,
    url,
    title,
    image,
    description,
    datePublished,
  });

  return (
    <Helmet>
      {/* General tags */}
      {/* <meta name="description" content={description} />
      <meta name="image" content={image} /> */}

      {/* Schema.org tags */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>

      {/* OpenGraph tags */}
      <meta property="og:url" content={url} />
      {isBlogPost ? <meta property="og:type" content="article" /> : null}
      <meta property="og:title" content={title} />
      {/* <meta property="og:description" content={description} />
      <meta property="og:image" content={image} /> 
      <meta property="fb:app_id" content={config.fbAppID} />*/}

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={config.twitter} />
      <meta name="twitter:title" content={title} />
      {/* <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} /> */}
    </Helmet>
  );
};

SEO.propTypes = {
  isBlogPost: PropTypes.bool,
  postData: PropTypes.shape({
    frontmatter: PropTypes.any,
    excerpt: PropTypes.any,
  }).isRequired,
};

SEO.defaultProps = {
  isBlogPost: false,
  postImage: null,
};

export default SEO;
