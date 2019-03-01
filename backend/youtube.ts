import config from './config';
import request from 'superagent';
import { Song } from './types';
import uuid from 'uuid';

// WTF youtube
// http://stackoverflow.com/questions/22148885/
// converting-youtube-data-api-v3-video-duration-format-to-seconds-in-javascript-no
const ytDurationToMillis = (ytDuration: string) => {
  const matches = ytDuration.match(/[0-9]+[HMS]/g);
  let seconds = 0;

  if (!matches) throw new Error('No match when converting YouTube duration');

  matches.forEach(function(part) {
    const unit = part.charAt(part.length - 1);
    const amount = parseInt(part.slice(0, -1));

    switch (unit) {
      case 'H':
        seconds += amount * 60 * 60;
        break;
      case 'M':
        seconds += amount * 60;
        break;
      case 'S':
        seconds += amount;
        break;
    }
  });

  return seconds * 1000;
};

const youtubeRe = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;

export const parseId = (songId: string) => {
  const match = songId.match(youtubeRe);

  if (match) {
    return match[1];
  }
};

export const getSongInfo = async (songId: string) => {
  const { body } = await request.get(
    `https://www.googleapis.com/youtube/v3/videos?id=${songId}&part=snippet%2CcontentDetails%2Cstatistics&key=${
      config.youtube!.apiKey
    }`,
  );

  if (!body || !body.items) {
    throw new Error('Song not found');
  }

  const ytSong = body.items[0];

  const song: Song = {
    songId,
    uuid: uuid.v4(),
    backend: 'youtube',
    thumbnailUrl: ytSong.snippet.thumbnails && ytSong.snippet.thumbnails.medium && ytSong.snippet.thumbnails.medium.url,
    title: ytSong.snippet.title,
    duration: ytDurationToMillis(ytSong.contentDetails.duration),
  };

  return song;
};
