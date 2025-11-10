/*
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required' });
  }
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) return res.status(400).json({ error: 'User with email or username already exists' });
    const hash = bcrypt.hashSync(password, 10);
    const info = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, hash);
    const user = db.prepare('SELECT id, username, email, bio, avatar_url, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);
    const token = signToken(user);
    return res.json({ token, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid email or password' });
    const safeUser = { id: user.id, username: user.username, email: user.email, bio: user.bio, avatar_url: user.avatar_url, created_at: user.created_at };
    const token = signToken(safeUser);
    return res.json({ token, user: safeUser });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, bio, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  return res.json({ user });
});

app.put('/api/me', authMiddleware, (req, res) => {
  const { bio = '', avatar_url = '' } = req.body;
  db.prepare('UPDATE users SET bio = ?, avatar_url = ? WHERE id = ?').run(bio, avatar_url, req.user.id);
  const user = db.prepare('SELECT id, username, email, bio, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  return res.json({ user });
});

// Profiles
app.get('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = db.prepare('SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const followers = db.prepare('SELECT COUNT(*) as c FROM follows WHERE followee_id = ?').get(id).c;
  const following = db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').get(id).c;
  const postsCount = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(id).c;
  return res.json({ user, stats: { followers, following, posts: postsCount } });
});

// Posts
app.post('/api/posts', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'content is required' });
  const info = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)').run(req.user.id, content.trim());
  const post = db.prepare('SELECT p.*, u.username, (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?').get(info.lastInsertRowid);
  return res.json({ post });
});

app.get('/api/posts/feed', authMiddleware, (req, res) => {
  // Show posts from self and followed users, newest first
  const rows = db.prepare(`
    SELECT p.*, u.username,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
      EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as liked
    FROM posts p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ? OR p.user_id IN (SELECT followee_id FROM follows WHERE follower_id = ?)
    ORDER BY p.created_at DESC
    LIMIT 100
  `).all(req.user.id, req.user.id, req.user.id);
  return res.json({ posts: rows });
});

app.get('/api/posts/user/:id', (req, res) => {
  const uid = Number(req.params.id);
  const rows = db.prepare(`
    SELECT p.*, u.username,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
    FROM posts p JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT 100
  `).all(uid);
  return res.json({ posts: rows });
});

// Comments
app.post('/api/comments', authMiddleware, (req, res) => {
  const { post_id, content } = req.body;
  if (!post_id || !content) return res.status(400).json({ error: 'post_id and content are required' });
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(post_id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const info = db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)').run(post_id, req.user.id, content);
  const comment = db.prepare('SELECT c.*, u.username FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?').get(info.lastInsertRowid);
  return res.json({ comment });
});

app.get('/api/comments/:postId', (req, res) => {
  const pid = Number(req.params.postId);
  const comments = db.prepare('SELECT c.*, u.username FROM comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = ? ORDER BY c.created_at ASC').all(pid);
  return res.json({ comments });
});

// Likes
app.post('/api/likes/toggle', authMiddleware, (req, res) => {
  const { post_id } = req.body;
  if (!post_id) return res.status(400).json({ error: 'post_id required' });
  const like = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').get(post_id, req.user.id);
  if (like) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(like.id);
    return res.json({ liked: false });
  } else {
    db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(post_id, req.user.id);
    return res.json({ liked: true });
  }
});

app.get('/api/likes/:postId', authMiddleware, (req, res) => {
  const pid = Number(req.params.postId);
  const count = db.prepare('SELECT COUNT(*) as c FROM likes WHERE post_id = ?').get(pid).c;
  const liked = !!db.prepare('SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?').get(pid, req.user.id);
  return res.json({ count, liked });
});

// Follows
app.post('/api/follow/toggle', authMiddleware, (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  if (user_id === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });
  const f = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND followee_id = ?').get(req.user.id, user_id);
  if (f) {
    db.prepare('DELETE FROM follows WHERE id = ?').run(f.id);
    return res.json({ following: false });
  } else {
    db.prepare('INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)').run(req.user.id, user_id);
    return res.json({ following: true });
  }
});

app.get('/api/follow/stats/:userId', authMiddleware, (req, res) => {
  const uid = Number(req.params.userId);
  const followers = db.prepare('SELECT COUNT(*) as c FROM follows WHERE followee_id = ?').get(uid).c;
  const following = db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').get(uid).c;
  const iFollow = !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(req.user.id, uid);
  return res.json({ followers, following, iFollow });
});

// Basic search users by username
app.get('/api/users/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [] });
  const users = db.prepare('SELECT id, username, bio, avatar_url FROM users WHERE username LIKE ? ORDER BY username ASC LIMIT 20').all(`%${q}%`);
  return res.json({ users });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});*/




const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.sqlite');

const app = express();
app.use(cors());
app.use(express.json());

// open/create sqlite db
const db = new Database(DB_FILE);

// Create minimal schema if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER,
    following_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    post_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// simple posts endpoint (read-only demo)
app.get('/api/posts', (req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.content, p.created_at, p.user_id, u.username
    FROM posts p LEFT JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all();
  res.json(rows);
});

// quick create user (demo only - no auth, for testing)
app.post('/api/users', (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: 'username required' });
  try {
    const info = db.prepare('INSERT INTO users (username) VALUES (?)').run(username);
    const user = db.prepare('SELECT id, username, bio, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});