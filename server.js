require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-admin-password';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret';
const ADMIN_PATH = process.env.ADMIN_PATH || '/admin-ecostep-2026';
const DATA_FILE = path.join(__dirname, 'data', 'family-data.json');

app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

function readFamilyData() {
  if (!fs.existsSync(DATA_FILE)) {
    return {};
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeFamilyData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }
  next();
}

app.post('/api/badge/verify', (req, res) => {
  const familyId = String(req.body.familyId || '').trim();
  const code = String(req.body.code || '').trim();

  if (!familyId || !code) {
    return res.status(400).json({ ok: false, message: 'Missing familyId or code' });
  }

  const data = readFamilyData();
  const row = data[familyId];

  if (!row || row.code !== code) {
    return res.status(401).json({ ok: false, message: '激活码错误' });
  }

  return res.json({ ok: true, fishCount: Number(row.fishCount) || 0 });
});

app.post('/api/admin/login', (req, res) => {
  const password = String(req.body.password || '');
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: '密码错误' });
  }

  req.session.isAdmin = true;
  return res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  if (!req.session) {
    return res.json({ ok: true });
  }

  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/admin/session', (req, res) => {
  const isAdmin = Boolean(req.session && req.session.isAdmin);
  return res.json({ ok: true, isAdmin });
});

app.get('/api/admin/families', requireAdmin, (req, res) => {
  return res.json({ ok: true, data: readFamilyData() });
});

app.put('/api/admin/families/:familyId', requireAdmin, (req, res) => {
  const familyId = String(req.params.familyId || '').trim();
  const code = String(req.body.code || '').trim();
  const fishCount = Number(req.body.fishCount);

  if (!/^\d{2}$/.test(familyId)) {
    return res.status(400).json({ ok: false, message: 'familyId must be two digits' });
  }
  if (!code) {
    return res.status(400).json({ ok: false, message: 'code is required' });
  }
  if (!Number.isInteger(fishCount) || fishCount < 0 || fishCount > 100000) {
    return res.status(400).json({ ok: false, message: 'fishCount must be an integer between 0 and 100000' });
  }

  const data = readFamilyData();
  data[familyId] = { code, fishCount };
  writeFamilyData(data);

  return res.json({ ok: true });
});

app.get(ADMIN_PATH, (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.listen(PORT, () => {
  console.log(`EcoStep server running at http://localhost:${PORT}`);
  console.log(`Admin panel path: ${ADMIN_PATH}`);
});

