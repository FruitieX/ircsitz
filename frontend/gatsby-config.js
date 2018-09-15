const theme = require('./src/themes/default')

module.exports = {
  siteMetadata: {
    title: 'ircsitz',
  },
  plugins: [
    'gatsby-plugin-typescript',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-jss',
      options: { theme },
    },
  ],
}
