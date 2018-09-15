interface Config {
  youtube?: {
    apiKey: string
  }
  maxSongDuration: number
  noDuplicates: boolean
  host: 'http://localhost:3000'
  apiRoot: string
  port: 3000
}

const config: Config = {
  youtube: {
    apiKey: 'AIzaSyBi8SM9GfJyr_xOY38ec2EJ4Y6w6-xVjdo',
  },
  maxSongDuration: 480000, // 8 minutes
  noDuplicates: true,
  host: 'http://localhost:3000',
  apiRoot: 'http://localhost:3000/api/v1',
  port: 3000,
}

export default config
