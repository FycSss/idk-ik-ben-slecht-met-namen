const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BCRYPT_ROUNDS = 12;

app.use(express.json({ limit: '1mb' }));

const ensureUsersFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, '[]\n', 'utf8');
  }
};

const readUsers = async () => {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid users storage format.');
  }
  return parsed;
};

const writeUsers = async (users) => {
  await fs.writeFile(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
};

const findUserByUsername = (users, username) => users.find((user) => user.username === username);

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authorization.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const validateCredentials = (username, password) => {
  if (typeof username !== 'string' || typeof password !== 'string') {
    return 'Username and password are required.';
  }
  if (username.length < 3 || username.length > 32) {
    return 'Username must be between 3 and 32 characters.';
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return 'Username contains invalid characters.';
  }
  if (password.length < 8 || password.length > 128) {
    return 'Password must be between 8 and 128 characters.';
  }
  return null;
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  const validationError = validateCredentials(username, password);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const normalizedUsername = username.toLowerCase();

  const users = await readUsers();
  if (findUserByUsername(users, normalizedUsername)) {
    return res.status(409).json({ error: 'Username already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = {
    id: crypto.randomUUID(),
    username: normalizedUsername,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  await writeUsers(users);

  return res.status(201).json({
    id: user.id,
    username: user.username
  });
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const users = await readUsers();
  const user = findUserByUsername(users, username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '7d'
  });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username
    }
  });
});

app.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user.sub,
      username: req.user.username
    }
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
