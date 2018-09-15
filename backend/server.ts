import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import HTTP from 'http';
import config from './config';
import * as api from './api';
import SocketIO from 'socket.io';

/**
 * API
 */

const app = new Koa();
app.use(cors());
app.use(bodyParser());
const prefix = '/api/v1';
const router = new Router({ prefix });

const server = HTTP.createServer(app.callback());
const io = SocketIO(server);

api.init(router, io);

app.use(router.routes()).use(router.allowedMethods());
//app.listen(config.port);
server.listen(config.port);
console.log('Listening on port', config.port);
