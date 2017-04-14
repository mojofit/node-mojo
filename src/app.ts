import * as express from "express";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as compression from "compression";
import * as path from "path";
import {Server} from "http";
import * as winston from "winston";
import MessageController from "./controllers/message_controller";

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

  private middleware() {
    this.express.use(cors());
    this.express.use(compression());
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: false}));
  }

  private initSocket(server) {
    const io = require('socket.io')(server);
    io.on('connection', socket => {
      let flag: boolean = true;
      winston.info('user connected -', socket.id);
      socket.on('message_request', chatMessage => {
        let message_response = MessageController.processMessage(chatMessage);
        socket.emit('message_response', message_response);
        if (flag) {
          winston.info(socket.id, '-', chatMessage.from);
          flag = false;
        }
      });
      socket.on('disconnect', () => winston.info('user disconnected -', socket.id));
    });
  }

  //TODO: for testing only
  private routes() {
    this.express.get('/', (req, res) => {
      res.sendFile(path.join(__dirname + '/../index.html'));
    });
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
