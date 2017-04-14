import * as express from "express";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as compression from "compression";
import * as path from "path";
import {Server} from "http";
import * as winston from "winston";

import HeroRouter from "./routes/hero_router";

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
  }

  init(server: Server) {
    this.middleware();
    this.routes();
    this.errorHandler();
    this.initSocket(server);
  }

  private middleware(): void {
    this.express.use(cors());
    this.express.use(compression());
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: false}));
  }

  private initSocket(server) {
    const io = require('socket.io')(server);
    io.on('connection', socket => {
      console.log('a user connected');
      socket.on('message_request', message => {
        console.log('got a message - ' + JSON.stringify(message));
        socket.emit('message_response', "hey dude");
      });
      socket.on('disconnect', function () {
        console.log('user disconnected');
      });
    });

  }

  private routes(): void {
    this.express.get('/', (req, res) => {
      res.sendFile(path.join(__dirname + '/../index.html'));
    });

    let router = express.Router();
    router.get('/hello', (req, res, next) => {
      res.json({
        message: 'Hello World!'
      });
    });
    this.express.use('/', router);
    this.express.use('/api/v1/heroes', HeroRouter);
  }

  private errorHandler() {
    this.express.use((req, res, next) => {
      let err: any = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    this.express.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.json({
        success: false,
        error: err.message
      });
    });
  }
}

export default new App();
