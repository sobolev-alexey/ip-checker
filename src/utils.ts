import { Request } from 'express';
import fetch from 'node-fetch';
import isIP from 'validator/lib/isIP';
import dotenv from 'dotenv';

dotenv.config();
const url: string = process.env.BLOCKLIST_SOURCE || '';

export const getClientIp = (req: Request) => {
  let ipAddress = req?.params?.ip;
  if (ipAddress?.substring(0, 7) == "::ffff:") {
    ipAddress = ipAddress?.substring(7);
  }
  return ipAddress || '';
};

export const fetchBlocklist = async () => {
  try {
    console.log('Fetching blocklist');
    const fetchedBlocklist: Set<string> = new Set();

    // Fetch new blocklist, apply gzip content encoding
    const response = await fetch(url, { compress: true });
    const data: string = await response.text();
    const contentLength = Number(response.headers.get('content-length') || 0)

    data.split('\n').reduce((acc: Set<string>, line: string) => {
      if (!line?.startsWith('#')) { // skip comments
        const ip = line?.split('\t')?.[0];
        if (ip && isIP(ip, 4)) {
          acc.add(ip?.trim());
        }
      }
      return acc;
    }, fetchedBlocklist);

    console.log(`Fetched ${fetchedBlocklist.size} entries; transferred ${contentLength} bytes`);
    // replace content of the existing blocklist 
    // only if newly fetched blocklist contains entries
    return fetchedBlocklist.size > 0 ? fetchedBlocklist : null;
  } catch (error) {
    console.error('fetchBlocklist', error);
  }
}