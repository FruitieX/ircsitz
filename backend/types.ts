export interface Song {
  songId: string
  uuid: string
  backend: 'spotify' | 'youtube'
  thumbnailUrl: string
  title: string
  duration: number // milliseconds
}

export type Playback =
  | {
      state: 'play'
      seek: number // updated when playback starts
      startedAt: number
    }
  | {
      state: 'pause'
      seek: number // updated when playback is paused
    }
  | {
      state: 'stop'
    }

type PlaybackState = Playback['state']

export interface Playlist {
  songs: Song[]
  currentPos: number
}

export interface State {
  playlist: Playlist
  playback: Playback
}

// API calls
export interface QueueBody {
  songId: string
}

export interface PlaybackBody {
  state: PlaybackState
  seek?: number
  skip?: number // skip this many songs in the playlist
}

export type PlaybackEvent = Playback & {
  song?: Song
}
