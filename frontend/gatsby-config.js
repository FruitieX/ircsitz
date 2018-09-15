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
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'ircsitz',
        short_name: 'ircsitz',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-offline',
  ],
}
