import React from "react"
import Layout from "../components/layout"
import GatsbyLink from "gatsby-link"

const NotFoundPage = () => (
  <Layout>
    <div>
      <GatsbyLink to="/player">Player</GatsbyLink>
    </div>
    <div>
      <GatsbyLink to="/queue">Queue</GatsbyLink>
    </div>
  </Layout>
)

export default NotFoundPage
