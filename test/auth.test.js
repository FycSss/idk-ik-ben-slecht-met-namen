const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');

process.env.JWT_SECRET = 'test-secret';

const app = require('../src/server');

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

const request = async (method, route, body, token) => {
  const headers = {};
  if (body) {
    headers['content-type'] = 'application/json';
  }
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  return {
    status: response.status,
    body: isJson ? await response.json() : null
  };
};

test.beforeEach(async () => {
  await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
  await fs.writeFile(usersFilePath, '[]\n', 'utf8');
});

test('register, login and access /me', async () => {
  const registerResponse = await request('POST', '/auth/register', {
    username: 'vriend1',
    password: 'testWachtwoord123'
  });

  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.username, 'vriend1');
  assert.ok(registerResponse.body.id);

  const loginResponse = await request('POST', '/auth/login', {
    username: 'vriend1',
    password: 'testWachtwoord123'
  });

  assert.equal(loginResponse.status, 200);
  assert.ok(loginResponse.body.token);
  assert.equal(loginResponse.body.user.username, 'vriend1');

  const meResponse = await request('GET', '/me', null, loginResponse.body.token);
  assert.equal(meResponse.status, 200);
  assert.equal(meResponse.body.user.username, 'vriend1');
});

test('denies /me without token', async () => {
  const meResponse = await request('GET', '/me');
  assert.equal(meResponse.status, 401);
});
