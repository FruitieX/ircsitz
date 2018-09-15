import Router from 'koa-router';
import * as YouTube from './youtube';
import {
  getState,
  enqueue,
  startPlayback,
  stopPlayback,
  dequeue,
  getCurrentSeek,
  getCurrentSong,
} from './state';
import { QueueBody, PlaybackBody } from './types';
import config from './config';

export const init = (router: Router, io: SocketIO.Server) => {
  // Get current app state
  router.get('/state', async ctx => {
    const state = getState();

    ctx.body = {
      ...state,
      seek: state.playback.state !== 'stop' ? state.playback.seek : 0,
    };
  });
  io.on('connection', socket => {
    console.log('client connected');
    const state = getState();

    socket.emit('state', {
      ...state,
      seek: getCurrentSeek(),
    });
    socket.emit('playback', {
      ...state.playback,
      seek: getCurrentSeek(),
      song: getCurrentSong(),
    });
  });

  // Queue a song
  router.post('/queue', async ctx => {
    const body = ctx.request.body as QueueBody;
    if (!body || !body.songId) {
      return ctx.throw(400, 'error', { message: 'song ID not provided' });
    }

    let songId: string | undefined;

    if (config.youtube && (songId = YouTube.parseId(body.songId))) {
      const song = await YouTube.getSongInfo(songId);
      const status = enqueue(song);
      if (status) {
        console.log(status);
        ctx.throw(400, 'error', { message: status });
      }

      io.emit('state', getState(), { for: 'everyone' });
      ctx.body = { status: 'ok' };
    } else {
      ctx.throw(400, 'error', { message: 'unsupported song ID' });
    }
  });

  // Control playback
  router.post('/playback', async ctx => {
    const body = ctx.request.body as PlaybackBody;

    if (body.state === 'play') {
      const status = startPlayback(body.seek, body.skip);
      if (status) {
        console.log(status);
        io.emit('playback', getState().playback, { for: 'everyone' });
        ctx.throw(400, 'error', { message: status });
      }
    } else if (body.state === 'pause') {
      stopPlayback(true);
    } else {
      stopPlayback();
    }

    io.emit(
      'playback',
      {
        ...getState().playback,
        song: getCurrentSong(),
      },
      { for: 'everyone' },
    );

    io.emit('state', getState(), { for: 'everyone' });

    ctx.body = { status: 'ok' };
  });

  // Dequeue a song
  router.delete('/queue/:uuid', async ctx => {
    const uuid: string = ctx.params.uuid;

    const status = dequeue(uuid);
    if (status) {
      console.log(status);
      ctx.throw(404, 'error', { message: status });
    }

    io.emit('state', getState(), { for: 'everyone' });

    ctx.body = { status: 'ok' };
  });
};
