module.exports = {
  siteMetadata: {
    title: "Gatsby Default Starter",
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/data`,
        name: "data",
      },
    },
    `gatsby-transformer-remark`,
    {
      resolve: "gatsby-plugin-typography",
      options: {
        pathToConfigModule: "src/utils/typography",
      },
    },
  ],
};
