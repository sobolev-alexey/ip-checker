import 'jest';
import request from 'supertest';

const { startWebServer, stopWebServer } = require('../src/app');

let expressApp: any;

beforeAll(async () => {
  expressApp = await startWebServer();
});

afterAll(async () => {
  await stopWebServer();
});

describe('API endpoints', () => {
  describe('Requests to non-existing endpoint', () => {
    test('Wrong URL should get http 404 error', async () => {
      const receivedResult = await request(expressApp).get('/wrong')
    
      // Assert
      expect(receivedResult.status).toBe(404);
    });
  });

  describe('Requests to /ips/[IP]', () => {
    test('When IP is in blocklist, should return "true"', async () => {
      // Act
      const result = await request(expressApp).get('/ips/2.189.59.146')

      // Assert
      expect(result.status).toBe(200);
      expect(result.text).toBe('true');
    });

    test('When IP is not in blocklist, should return "false"', async () => {
      // Act
      const result = await request(expressApp).get('/ips/127.0.0.1')

      // Assert
      expect(result.status).toBe(200);
      expect(result.text).toBe('false');
    });

    test('When IP value does not match the IP schema, should return "{"error":"Wrong IP format"}"', async () => {
      // Act
      const result = await request(expressApp).get('/ips/1234567')

      // Assert
      expect(result.status).toBe(400);
      expect(result.text).toBe('{"error":"Wrong IP format"}');
    });
  });
});