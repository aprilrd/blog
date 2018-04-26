import React from "react";
import Link from "gatsby-link";

import * as config from "../../config";

const Header = () => (
  <div>
    <div
      style={{
        margin: "0 auto",
        maxWidth: "42rem",
        padding: "1.5rem 1.125rem",
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
    </div>
  </div>
);

export default Header;
