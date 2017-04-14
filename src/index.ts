import * as http from "http";
import * as path from "path";
import * as debug from "debug";
import * as dotenv from "dotenv";
import * as mkdirp from "mkdirp";
import * as winston from "winston";

import App from "./app";

class Config {
  private static server: http.Server;
  private static port: number;

  constructor() {
    dotenv.config();
    debug('node-mongo:server');
    Config.init();
  }

  private static init() {
    Config.initLogger();
    Config.startServer();
    Config.initApp();
  }

  private static initLogger() {
    mkdirp.sync(process.env.LOG_DIRECTORY);
    winston.add(require('winston-daily-rotate-file'), {
      filename: path.join(process.env.LOG_DIRECTORY, process.env.LOG_FILE),
      timestamp: () => Math.floor(Date.now() / 1000)
    });
    winston.remove(winston.transports.Console);
    if (process.env.PROD.toLowerCase() !== 'true') {
      winston.add(winston.transports.Console, {
        prettyPrint: true,
        colorize: true,
        timestamp: false
      });
    }
  }

  private static startServer() {
    const port = Config.normalizePort(process.env.PORT || 3000);
    App.express.set('port', port);
    Config.server = http.createServer(App.express);
    Config.server.listen(port);
    Config.server.on('error', Config.onError);
    Config.server.on('listening', Config.onListening);
  }

  private static initApp() {
    App.init(Config.server);
  }

  private static normalizePort(val: number | string): number | string | boolean {
    Config.port = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(Config.port)) return val;
    else if (Config.port >= 0) return Config.port;
    else return false;
  }

  private static onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof Config.port === 'string') ? 'Pipe ' + Config.port : 'Port ' + Config.port;
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  private static onListening(): void {
    let addr = Config.server.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
  }
}

export default new Config();
