import fs from 'fs';
import path from 'path';

import config from './config';
import { State, Song } from './types';

let state: State = {
  playlist: {
    songs: [],
    currentPos: 0,
  },
  playback: {
    state: 'stop',
  },
};

try {
  state = require('./.state.json');
  console.log('Restored state from .state.json');
} catch {
  console.log('Warning: Failed to restore state, using default state');
}

const storeState = () => {
  fs.writeFileSync(
    path.join(__dirname, '.state.json'),
    JSON.stringify(state, undefined, 2),
  );
  console.log('Stored state.');
};

/**
 * Gets upcoming (or "queued") songs in playlist
 */
export const getUpcomingSongs = () => {
  if (state.playback.state === 'stop') return state.playlist.songs;

  return state.playlist.songs.filter(
    (_song, index) => index > state.playlist.currentPos,
  );
};

/**
 * Returns current state
 */
export const getState = () => state;

/**
 * Returns current song, if any
 */
export const getCurrentSong = (): Song | undefined =>
  state.playlist.songs[state.playlist.currentPos];

/**
 * Enqueues a song.
 * @param song Song to enqueue
 */
export const enqueue = (song: Song) => {
  if (song.duration > config.maxSongDuration) {
    throw new Error('Song is too long.');
  }

  if (config.noDuplicates) {
    if (
      getUpcomingSongs().find(
        playlistSong => playlistSong.songId === song.songId,
      )
    ) {
      return 'Song already in queue.';
    }
  }

  state.playlist.songs.push(song);

  console.log('Enqueued song', song.title);
  storeState();
};

/**
 * Dequeues a song.
 * @param uuid Song UUID to dequeue
 */

// TODO: this is horribly wrong if dequeuing current song or a past song :)
export const dequeue = (uuid: string) => {
  const index = state.playlist.songs.findIndex(song => song.uuid === uuid);

  if (index === -1) {
    return 'Song not found';
  }

  state.playlist.songs.splice(index, 1);

  console.log('Dequeued song', uuid);
  storeState();
};

/**
 * Starts playback.
 * @param seek Optional seek parameter used to seek within a song
 * @param skip Optional number of songs to skip (can be negative to go back)
 */
export const startPlayback = (seek?: number, skip?: number) => {
  const numSongs = state.playlist.songs.length;

  if (skip) {
    console.log(state.playlist.currentPos);
    state.playlist.currentPos = Math.max(
      0,
      Math.min(state.playlist.currentPos + skip, numSongs),
    );
    console.log(state.playlist.currentPos);
  }

  if (state.playlist.currentPos >= numSongs) {
    stopPlayback();
    return 'Hit end of playlist.';
  }

  let prevSeek = state.playback.state !== 'stop' ? state.playback.seek : 0;

  // Reset seek if skipping song without specifying seek
  if (seek === undefined && skip) {
    prevSeek = 0;
  }

  state.playback = {
    state: 'play',
    seek: seek !== undefined ? seek : prevSeek,
    startedAt: new Date().getTime(),
  };

  const nowPlaying = state.playlist.songs[state.playlist.currentPos];

  console.log(`Started playback of song ${nowPlaying.title}`);
  storeState();
};

export const getCurrentSeek = () => {
  const playback = state.playback;

  if (playback.state === 'play') {
    return playback.seek + (new Date().getTime() - playback.startedAt);
  } else if (playback.state === 'pause') {
    return playback.seek;
  }

  return 0;
};

/**
 * Stops playback.
 * @param pause Whether to pause or stop playback
 */
export const stopPlayback = (pause?: boolean) => {
  if (pause) {
    const prevState = state.playback;

    if (prevState.state === 'play') {
      state.playback = {
        state: 'pause',
        seek: getCurrentSeek(),
      };
    }
  } else {
    state.playback = {
      state: 'stop',
    };
    //state.playlist.currentPos = 0;
  }

  console.log('Stopped playback.');
  storeState();
};
