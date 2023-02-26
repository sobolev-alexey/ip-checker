import express, { Express, Request, Response } from 'express';
import { param, validationResult, Result, ValidationError } from 'express-validator';
import dotenv from 'dotenv';
import compression from 'compression';
import { getClientIp, fetchBlocklist } from './utils';

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(compression()); // compress responses
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

let blocklist: Set<string> = new Set();

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

app.listen(port, async () => {
  try {
    console.log(`App listening on port ${port}`);

    // Fetch initial values for blocklist
    blocklist = await fetchBlocklist() ?? blocklist; // overwrite with new content or leave as is

    // Re-fetch and update values daily
    setInterval(async () => {
      blocklist = await fetchBlocklist() ?? blocklist; // overwrite with new content or leave as is
    }, 24 * 60 * 60 * 1000 /* 24h */);

  } catch (error) {
    console.error('Error in server setup', error);
  }
});
