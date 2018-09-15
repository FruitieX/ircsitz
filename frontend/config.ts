interface Config {
  youtube?: {
    apiKey: string
  }
  maxSongDuration: number
  noDuplicates: boolean
  host: string
  apiRoot: string
  port: number
}

const config: Config = {
  youtube: {
    apiKey: 'AIzaSyBi8SM9GfJyr_xOY38ec2EJ4Y6w6-xVjdo',
  },
  maxSongDuration: 480000, // 8 minutes
  noDuplicates: true,
  host: 'http://player.fruitiex.org',
  apiRoot: 'http://player.fruitiex.org/api/v1',
  port: 3000,
}

export default config
