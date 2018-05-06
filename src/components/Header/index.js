import React from "react";
import Link from "gatsby-link";

import * as config from "../../config";

const Header = () => (
  <div>
    <div
      style={{
        margin: "0 auto",
        maxWidth: "42rem",
        padding: "1.5rem 1.125rem 0rem",
      }}
    >
      <h1 style={{ margin: 0 }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
          }}
        >
          {config.blogTitle}
        </Link>
      </h1>
      <div>On Humans, Javascript, and Tech</div>
      <div>
        <Link
          to="/"
          style={{
            textDecoration: "none",
          }}
        >
          Home
        </Link>{" "}
        |{" "}
        <Link
          to="/tags"
          style={{
            textDecoration: "none",
          }}
        >
          Tags
        </Link>{" "}
        |{" "}
        <Link
          to="/daily-readings"
          style={{
            textDecoration: "none",
          }}
        >
          Daily Readings
        </Link>
      </div>
    </div>
  </div>
);

export default Header;
