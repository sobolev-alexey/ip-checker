import express, { Express, Request, Response } from 'express';
import { param, validationResult, Result, ValidationError } from 'express-validator';
import dotenv from 'dotenv';
import cors from 'cors';
import logger from 'morgan';
import { IncomingMessage, Server, ServerResponse } from 'http';
import 'express-async-errors';
import { getClientIp, fetchBlocklist } from './utils';

dotenv.config();

let serverConnection: Server<typeof IncomingMessage, typeof ServerResponse>;
let blocklist: Set<string> = new Set();

export const startWebServer = async () => {
  return new Promise(async (resolve, reject) => {
    const app: Express = express();

    app.use(logger('dev'));
    app.use(express.text());
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));

    app.get(
      `/ips/:ip`, 
      param('ip', 'Wrong IP format').isIP(4), // param validation
      (req: Request, res: Response) => {
        try {
          const errors: Result<ValidationError> = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).send({ error: errors.mapped()?.ip?.msg });
          }
    
          const ipAddress: string = getClientIp(req);
          const ipCheckResult: boolean = blocklist.has(ipAddress);
          // console.log(`Checking ${ipAddress}. Result: ${ipCheckResult}`);
          res.status(200).send(ipCheckResult);
    
        } catch (error) {
          res.status(400).send({ error });
        }
    });

    const port = process.env.PORT || 3000;
    serverConnection = app.listen(port, async () => {
      try {
        console.log(`App listening on port ${port}`);
    
        // Fetch initial values for blocklist
        blocklist = await fetchBlocklist() ?? blocklist; // overwrite with new content or leave as is
    
        // Re-fetch and update values daily
        setInterval(async () => {
          blocklist = await fetchBlocklist() ?? blocklist; // overwrite with new content or leave as is
        }, 24 * 60 * 60 * 1000 /* 24h */);
    
        resolve(app);

      } catch (error) {
        console.error('Error in server setup', error);
        reject(error);
      }
    });
  });
};

export const stopWebServer = async () => {
  return new Promise((resolve, reject) => {
    serverConnection.close(() => {
      resolve(null);
    });
  });
};
