// =============================================================================
// server.js — DoCA Smart Agricultural Procurement Portal
// SIH 2026 | Problem Statement ID: 26032
// Express REST API + sql.js (pure-JS SQLite) + IVR + Chatbot Engine + SSE
// =============================================================================

import 'dotenv/config';          // load .env vars before anything else
import express from 'express';
import cors    from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// sql.js uses CommonJS — bridge with createRequire
const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');

const app  = express();
const PORT = 5000;
const DB_PATH = join(__dirname, 'database.bin');

// ---------------------------------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------------------------------
// CORS — accept any localhost port (dev) + production origin
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, curl) or any localhost port
    if (!origin || origin.startsWith('http://localhost')) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ---------------------------------------------------------------------------
// DATABASE — initialise sql.js (pure-JS SQLite, no native compilation)
// ---------------------------------------------------------------------------
let db;

async function initDb() {
  const SQL = await initSqlJs();

  // Load existing DB file if present
  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('📂 Existing database loaded from disk.');
  } else {
    db = new SQL.Database();
    console.log('🆕 New database created.');
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS slots (
      id                TEXT PRIMARY KEY,
      farmer_name       TEXT NOT NULL,
      phone             TEXT NOT NULL,
      crop              TEXT NOT NULL,
      quantity          REAL NOT NULL,
      center_location   TEXT NOT NULL,
      target_date       TEXT NOT NULL,
      token_number      INTEGER NOT NULL,
      source            TEXT NOT NULL DEFAULT 'Mobile App',
      queue_status      TEXT NOT NULL DEFAULT 'pending',
      payment_status    TEXT NOT NULL DEFAULT 'crop_handed',
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS registered_farmers (
      id          TEXT PRIMARY KEY,
      full_name   TEXT NOT NULL,
      aadhaar     TEXT UNIQUE NOT NULL,
      phone       TEXT NOT NULL,
      password    TEXT NOT NULL,
      village     TEXT DEFAULT '',
      district    TEXT DEFAULT '',
      state       TEXT DEFAULT 'Uttar Pradesh',
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sms_log (
      id        TEXT PRIMARY KEY,
      phone     TEXT NOT NULL,
      message   TEXT NOT NULL,
      sent_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_actions (
      id             TEXT PRIMARY KEY,
      action_type    TEXT NOT NULL,
      target_slot_id TEXT,
      details        TEXT,
      performed_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Serving token counter
  const stateRows = db.exec("SELECT value FROM app_state WHERE key = 'serving_token'");
  if (!stateRows.length || !stateRows[0].values.length) {
    db.run("INSERT INTO app_state (key, value) VALUES ('serving_token', '1')");
  }

  // Seed data if table empty
  const countResult = db.exec('SELECT COUNT(*) as cnt FROM slots');
  const count = countResult[0]?.values[0][0] || 0;

  if (count === 0) {
    const seeds = [
      { id: uuidv4(), farmer_name: 'Ramesh Kumar',  phone: '9876543210', crop: 'Wheat',   quantity: 50, center_location: 'Mandi Bhawan, Lucknow',      target_date: '2026-09-10', token_number: 1, source: 'Mobile App',          queue_status: 'serving',   payment_status: 'invoice_generated' },
      { id: uuidv4(), farmer_name: 'Sunita Devi',   phone: '9123456780', crop: 'Paddy',   quantity: 75, center_location: 'Grain Centre, Varanasi',      target_date: '2026-09-10', token_number: 2, source: 'IVR / Feature Phone', queue_status: 'pending',   payment_status: 'crop_handed' },
      { id: uuidv4(), farmer_name: 'Mohan Lal',     phone: '9988776655', crop: 'Maize',   quantity: 30, center_location: 'Agri Hub, Kanpur',            target_date: '2026-09-11', token_number: 3, source: 'Mobile App',          queue_status: 'pending',   payment_status: 'verified' },
      { id: uuidv4(), farmer_name: 'Priya Sharma',  phone: '9765432109', crop: 'Wheat',   quantity: 20, center_location: 'Mandi Bhawan, Lucknow',       target_date: '2026-09-11', token_number: 4, source: 'IVR / Feature Phone', queue_status: 'pending',   payment_status: 'crop_handed' },
      { id: uuidv4(), farmer_name: 'Arjun Yadav',   phone: '9654321098', crop: 'Paddy',   quantity: 90, center_location: 'Grain Centre, Varanasi',      target_date: '2026-09-12', token_number: 5, source: 'Mobile App',          queue_status: 'completed', payment_status: 'disbursed' },
      { id: uuidv4(), farmer_name: 'Geeta Patel',   phone: '9543210987', crop: 'Mustard', quantity: 40, center_location: 'Procurement Depot, Agra',     target_date: '2026-09-13', token_number: 6, source: 'IVR / Feature Phone', queue_status: 'pending',   payment_status: 'crop_handed' },
    ];
    for (const s of seeds) {
      db.run(
        `INSERT INTO slots (id, farmer_name, phone, crop, quantity, center_location, target_date, token_number, source, queue_status, payment_status, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [s.id, s.farmer_name, s.phone, s.crop, s.quantity, s.center_location, s.target_date, s.token_number, s.source, s.queue_status, s.payment_status, new Date().toISOString()]
      );
    }
    persistDb();
    console.log('✅ Seed data inserted.');
  }
}

// ---------------------------------------------------------------------------
// PERSISTENCE — write DB to disk after every mutation
// ---------------------------------------------------------------------------
function persistDb() {
  try {
    const data = db.export();
    writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {
    console.error('persist error:', e.message);
  }
}

// ---------------------------------------------------------------------------
// QUERY HELPERS
// ---------------------------------------------------------------------------
function queryAll(sql, params = []) {
  const res = db.exec(sql.replace(/\?/g, () => '?'), params.length ? undefined : undefined);
  // sql.js exec doesn't support parameterised queries; use prepare/bind
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  const colNames = stmt.getColumnNames();
  while (stmt.step()) {
    const row = {};
    const vals = stmt.get();
    colNames.forEach((c, i) => { row[c] = vals[i]; });
    rows.push(row);
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  persistDb();
}

function getNextToken() {
  const row = queryOne('SELECT MAX(token_number) as max_token FROM slots');
  return (row?.max_token || 0) + 1;
}

// ---------------------------------------------------------------------------
// OTP ENGINE — In-memory store (expires in 10 min, max 3 attempts)
// ---------------------------------------------------------------------------
const otpStore = new Map();
// key: phone  →  { otp, expires, attempts, purpose, aadhaar? }

function generateOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }

function storeOtp(phone, purpose, aadhaar = null) {
  const otp     = generateOtp();
  const expires = Date.now() + 10 * 60 * 1000; // 10 min
  otpStore.set(phone, { otp, expires, attempts: 0, purpose, aadhaar });
  return otp;
}

function verifyOtp(phone, inputOtp, purpose) {
  const entry = otpStore.get(phone);
  if (!entry)                          return { ok: false, reason: 'No OTP found. Please request a new one.' };
  if (Date.now() > entry.expires)      return { ok: false, reason: 'OTP has expired. Please request a new one.' };
  if (entry.purpose !== purpose)       return { ok: false, reason: 'OTP purpose mismatch.' };
  entry.attempts++;
  if (entry.attempts > 3)              return { ok: false, reason: 'Too many wrong attempts. Request a new OTP.' };
  if (entry.otp !== inputOtp.trim())   return { ok: false, reason: `Incorrect OTP. ${3 - entry.attempts + 1} attempt(s) left.` };
  otpStore.delete(phone);              // invalidate after use
  return { ok: true };
}

// POST /api/auth/send-otp
// body: { phone, purpose }  purpose: 'register' | 'forgot_password' | 'reverify'
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone, purpose = 'register', aadhaar } = req.body;
  if (!phone || !/^\d{10}$/.test(phone))
    return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required.' });

  // Rate-limit: no more than 1 OTP per minute per phone
  const existing = otpStore.get(phone);
  if (existing && (existing.expires - Date.now()) > 9 * 60 * 1000)
    return res.status(429).json({ success: false, message: 'OTP already sent. Please wait 1 minute before requesting again.' });

  const otp = storeOtp(phone, purpose, aadhaar || null);
  const msg = `DoCA Kisan Portal OTP: ${otp} (valid 10 min). Do NOT share with anyone. Helpline: 1800-XXX-FARM`;
  await dispatchSms(phone, msg);
  console.log(`🔑 OTP [${purpose}] → +91${phone}: ${otp}`);

  res.json({ success: true, message: `OTP sent to +91 ${phone}. Valid for 10 minutes.`, dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined });
});

// POST /api/auth/verify-otp
// body: { phone, otp, purpose }
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, purpose } = req.body;
  if (!phone || !otp || !purpose)
    return res.status(400).json({ success: false, message: 'phone, otp, and purpose are required.' });

  const result = verifyOtp(phone, otp, purpose);
  if (!result.ok) return res.status(400).json({ success: false, message: result.reason });
  res.json({ success: true, message: 'OTP verified successfully.' });
});

// POST /api/auth/forgot-password
// body: { aadhaar, phone }  — checks Aadhaar+phone match, then sends OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  const { aadhaar, phone } = req.body;
  if (!aadhaar || !phone)
    return res.status(400).json({ success: false, message: 'Aadhaar and phone are required.' });

  const farmer = queryOne('SELECT * FROM registered_farmers WHERE aadhaar = ? AND phone = ?', [aadhaar, phone]);
  if (!farmer)
    return res.status(404).json({ success: false, message: 'No account found with this Aadhaar + phone combination.' });

  const otp = storeOtp(phone, 'forgot_password', aadhaar);
  const msg = `DoCA Password Reset OTP: ${otp} (valid 10 min). Do NOT share. If you didn't request this, call 1800-XXX-FARM.`;
  await dispatchSms(phone, msg);
  console.log(`🔑 Forgot-pwd OTP → +91${phone}: ${otp}`);

  res.json({ success: true, message: `Reset OTP sent to +91 ${phone}. Enter it to set a new password.`, maskedPhone: `+91 ****${phone.slice(-4)}` });
});

// POST /api/auth/reset-password
// body: { aadhaar, phone, otp, newPassword }
app.post('/api/auth/reset-password', (req, res) => {
  const { aadhaar, phone, otp, newPassword } = req.body;
  if (!aadhaar || !phone || !otp || !newPassword)
    return res.status(400).json({ success: false, message: 'All fields required.' });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

  const result = verifyOtp(phone, otp, 'forgot_password');
  if (!result.ok) return res.status(400).json({ success: false, message: result.reason });

  // Update password
  const farmer = queryOne('SELECT id FROM registered_farmers WHERE aadhaar = ? AND phone = ?', [aadhaar, phone]);
  if (!farmer) return res.status(404).json({ success: false, message: 'Account not found.' });

  run('UPDATE registered_farmers SET password = ? WHERE aadhaar = ?', [newPassword, aadhaar]);
  console.log(`🔒 Password reset for Aadhaar ****${aadhaar.slice(-4)}`);
  res.json({ success: true, message: 'Password updated successfully! You can now login.' });
});

// ---------------------------------------------------------------------------
// SSE — Server-Sent Events for real-time push
// ---------------------------------------------------------------------------
const sseClients = new Set();

function pushSse(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch (_) { sseClients.delete(res); }
  }
}

// ---------------------------------------------------------------------------
// SMS HELPER — Real Fast2SMS delivery when FAST2SMS_KEY is set in .env
// ---------------------------------------------------------------------------
async function dispatchSms(phone, message) {
  const id      = uuidv4();
  const sent_at = new Date().toISOString();
  run('INSERT INTO sms_log (id, phone, message, sent_at) VALUES (?,?,?,?)', [id, phone, message, sent_at]);

  const F2S_KEY = process.env.FAST2SMS_KEY;

  if (F2S_KEY && F2S_KEY !== 'your_fast2sms_api_key_here') {
    // ── REAL Fast2SMS delivery ──────────────────────────────────────────────
    try {
      const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': F2S_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',         // quick transactional route
          message: message.substring(0, 160),
          language: 'english',
          flash: 0,
          numbers: phone,     // 10-digit Indian mobile
        }),
      });
      const data = await resp.json();
      if (data.return) {
        console.log(`✅ SMS SENT via Fast2SMS → +91${phone}`);
      } else {
        console.warn(`⚠️ Fast2SMS error → ${phone}: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      console.error(`❌ Fast2SMS failed → ${phone}: ${e.message}`);
    }
  } else {
    // ── Dev fallback — Twilio boilerplate (uncomment to use) ───────────────
    // import twilio from 'twilio';
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // client.messages.create({ body: message, from: process.env.TWILIO_FROM, to: `+91${phone}` });
    console.log(`📱 [DEV] SMS → +91${phone}: ${message.substring(0, 80)}…`);
    console.log(`   ℹ️  Add FAST2SMS_KEY to .env to send real SMS`);
  }

  return { id, phone, message, sent_at };
}


// ---------------------------------------------------------------------------
// ROUTES — Slots
// ---------------------------------------------------------------------------
app.get('/api/slots', (_req, res) => {
  const slots = queryAll('SELECT * FROM slots ORDER BY token_number ASC');
  res.json({ success: true, data: slots });
});

app.get('/api/slots/:id', (req, res) => {
  const slot = queryOne('SELECT * FROM slots WHERE id = ?', [req.params.id]);
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
  res.json({ success: true, data: slot });
});

// POST /api/slots — Mobile App booking
app.post('/api/slots', (req, res) => {
  const { farmer_name, phone, crop, quantity, center_location, target_date } = req.body;
  if (!farmer_name || !phone || !crop || !quantity || !center_location || !target_date)
    return res.status(400).json({ success: false, message: 'All fields are required' });

  const id           = uuidv4();
  const token_number = getNextToken();
  const created_at   = new Date().toISOString();

  run(
    `INSERT INTO slots (id, farmer_name, phone, crop, quantity, center_location, target_date, token_number, source, queue_status, payment_status, created_at)
     VALUES (?,?,?,?,?,?,?,?,'Mobile App','pending','crop_handed',?)`,
    [id, farmer_name, phone, crop, quantity, center_location, target_date, token_number, created_at]
  );

  const smsText = `DoCA ALERT: Namaste ${farmer_name}! Token #${token_number} confirmed for ${crop} (${quantity} qtl) at ${center_location} on ${target_date}. Helpline: 1800-XXX-FARM.`;
  const smsEntry = dispatchSms(phone, smsText);

  pushSse({ type: 'sms',       data: smsEntry });
  pushSse({ type: 'slot_added', data: { id, token_number, farmer_name, crop, source: 'Mobile App' } });

  res.status(201).json({
    success: true,
    data: { id, token_number, farmer_name, phone, crop, quantity, center_location, target_date, source: 'Mobile App', created_at },
    sms: smsEntry,
  });
});

// POST /api/slots/ivr — IVR / Feature Phone booking
app.post('/api/slots/ivr', (req, res) => {
  const { farmer_name, phone, crop, quantity } = req.body;

  const id             = uuidv4();
  const token_number   = getNextToken();
  const created_at     = new Date().toISOString();
  const center_location = 'IVR Auto-Assigned Centre';
  const target_date    = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const qty            = quantity || 25;
  const name           = farmer_name || `IVR Caller (${phone})`;
  const ph             = phone || '0000000000';

  run(
    `INSERT INTO slots (id, farmer_name, phone, crop, quantity, center_location, target_date, token_number, source, queue_status, payment_status, created_at)
     VALUES (?,?,?,?,?,?,?,?,'IVR / Feature Phone','pending','crop_handed',?)`,
    [id, name, ph, crop, qty, center_location, target_date, token_number, created_at]
  );

  const smsText = `DoCA PHONE BOOKING: Token #${token_number} confirm hua! Fasal: ${crop}. Kendra: ${center_location}. Helpline: 1800-XXX-FARM. Jai Kisan!`;
  const smsEntry = dispatchSms(ph, smsText);

  pushSse({ type: 'sms',       data: smsEntry });
  pushSse({ type: 'slot_added', data: { id, token_number, farmer_name: name, crop, source: 'IVR / Feature Phone' } });

  res.status(201).json({
    success: true,
    data: { id, token_number, farmer_name: name, phone: ph, crop, quantity: qty, center_location, target_date, source: 'IVR / Feature Phone', created_at },
    sms: smsEntry,
  });
});

// PATCH /api/slots/:id/queue — requires 'queue' permission
app.patch('/api/slots/:id/queue', requirePermission('queue'), (req, res) => {
  const { queue_status } = req.body;
  const valid = ['pending', 'serving', 'completed'];
  if (!valid.includes(queue_status)) return res.status(400).json({ success: false, message: 'Invalid queue status' });

  const slot = queryOne('SELECT * FROM slots WHERE id = ?', [req.params.id]);
  if (!slot) return res.status(404).json({ success: false, message: 'Not found' });

  run('UPDATE slots SET queue_status = ? WHERE id = ?', [queue_status, req.params.id]);

  if (queue_status === 'serving') {
    run("UPDATE app_state SET value = ? WHERE key = 'serving_token'", [String(slot.token_number)]);
    const sms = dispatchSms(slot.phone, `DoCA: Token #${slot.token_number} ab active hai! Krpaya procurement kendra par aajayein.`);
    pushSse({ type: 'sms', data: sms });
  }

  run('INSERT INTO admin_actions (id, action_type, target_slot_id, details, performed_at) VALUES (?,?,?,?,?)',
    [uuidv4(), 'advance_queue', req.params.id, `Status → ${queue_status} by ${req.adminUsername}`, new Date().toISOString()]);

  pushSse({ type: 'queue_updated', data: { id: req.params.id, queue_status } });
  res.json({ success: true, data: { id: req.params.id, queue_status } });
});

// PATCH /api/slots/:id/payment — per-stage permission required
app.patch('/api/slots/:id/payment', (req, res, next) => {
  // Determine which permission is needed based on the target status
  const { payment_status } = req.body;
  const permMap = {
    crop_handed:       'crop',
    verified:          'quality',
    quality_verified:  'quality',
    invoice_generated: 'invoice',
    disbursed:         'payment',
  };
  const neededPerm = permMap[payment_status];
  if (!neededPerm) return res.status(400).json({ success: false, message: 'Invalid payment_status' });
  // Apply dynamic RBAC
  requirePermission(neededPerm)(req, res, next);
}, (req, res) => {
  const { payment_status } = req.body;
  const valid = ['crop_handed', 'verified', 'quality_verified', 'invoice_generated', 'disbursed'];
  if (!valid.includes(payment_status)) return res.status(400).json({ success: false, message: 'Invalid payment status' });

  const slot = queryOne('SELECT * FROM slots WHERE id = ?', [req.params.id]);
  if (!slot) return res.status(404).json({ success: false, message: 'Not found' });

  run('UPDATE slots SET payment_status = ? WHERE id = ?', [payment_status, req.params.id]);

  const msgs = {
    crop_handed:       `DoCA: Token #${slot.token_number}: Aapki fasal prapt hui. Dhanyavaad!`,
    verified:          `DoCA: Token #${slot.token_number}: Quality verify ho gayi. Invoice ban raha hai.`,
    quality_verified:  `DoCA: Token #${slot.token_number}: Quality verify ho gayi. Invoice ban raha hai.`,
    invoice_generated: `DoCA: Token #${slot.token_number}: Invoice taiyaar. DBT transfer shuru hoga.`,
    disbursed:         `DoCA: Token #${slot.token_number}: Paisa aapke bank account mein transfer ho gaya! - DoCA Jai Kisan 🌾`,
  };
  const sms = dispatchSms(slot.phone, msgs[payment_status]);

  run('INSERT INTO admin_actions (id, action_type, target_slot_id, details, performed_at) VALUES (?,?,?,?,?)',
    [uuidv4(), 'update_payment', req.params.id, `Payment → ${payment_status} by ${req.adminUsername}`, new Date().toISOString()]);

  pushSse({ type: 'sms',             data: sms });
  pushSse({ type: 'payment_updated', data: { id: req.params.id, payment_status } });
  res.json({ success: true, data: { id: req.params.id, payment_status } });
});

// GET /api/serving-token
app.get('/api/serving-token', (_req, res) => {
  const row = queryOne("SELECT value FROM app_state WHERE key = 'serving_token'");
  res.json({ success: true, serving_token: parseInt(row?.value || '1', 10) });
});

// ---------------------------------------------------------------------------
// CHATBOT — POST /api/chatbot
// ---------------------------------------------------------------------------
const KB = [
  {
    intents: ['book', 'slot', 'schedule', 'booking', 'बुक', 'स्लॉट', 'बुकिंग', 'कैसे बुक', 'register', 'स्लॉट बुक', 'बुक करा', 'నమోదు', 'బుక్'],
    en: "To book a slot: Go to 'Book a Slot' on your Farmer Dashboard. Fill in Centre, Crop, Quantity, and Date. Your Token Number is generated instantly! You can also call 1800-XXX-FARM from any phone.",
    hi: "स्लॉट बुक करने के लिए: किसान डैशबोर्ड पर जाएं। केंद्र, फसल, मात्रा और तारीख भरें। टोकन नंबर तुरंत मिलेगा! आप 1800-XXX-FARM पर फोन भी कर सकते हैं।",
    mr: "स्लॉट बुक करण्यासाठी: शेतकरी डॅशबोर्डवर 'स्लॉट बुक करा' वर जा. केंद्र, पीक, प्रमाण आणि तारीख भरा. टोकन नंबर लगेच मिळेल! 1800-XXX-FARM वर कॉल करूनही बुक करता येते.",
    te: "స్లాట్ బుక్ చేయడానికి: రైతు డాష్‌బోర్డ్‌లో 'స్లాట్ బుక్ చేయండి' పై వెళ్ళండి. కేంద్రం, పంట, పరిమాణం మరియు తేదీ నమోదు చేయండి. టోకెన్ నంబర్ వెంటనే వస్తుంది! 1800-XXX-FARM కి ఫోన్ చేసి కూడా బుక్ చేయవచ్చు.",
  },
  {
    intents: ['token', 'status', 'queue', 'टोकन', 'स्टेटस', 'कहां है', 'नंबर', 'waiting', 'रांग', 'टोकन', 'టోకెన్', 'క్యూ'],
    en: "Check your Token in the 'Queue Tracker' section. It shows: Your Token #, Active Serving Token, Farmers Ahead, and Estimated Wait Time in minutes.",
    hi: "टोकन स्टेटस 'कतार ट्रैकर' में देखें। यहाँ आपका टोकन नंबर, सक्रिय टोकन, आगे के किसान और प्रतीक्षा समय दिखता है।",
    mr: "टोकन स्टेटस 'रांग ट्रॅकर' मध्ये पहा. तुमचा टोकन नंबर, सक्रिय टोकन, पुढे असलेले शेतकरी आणि प्रतीक्षा वेळ दिसतो.",
    te: "'క్యూ ట్రాకర్' విభాగంలో మీ టోకెన్ తనిఖీ చేయండి. మీ టోకెన్ #, యాక్టివ్ సర్వింగ్ టోకెన్, ముందు రైతులు మరియు వేచి ఉండే సమయం చూపిస్తుంది.",
  },
  {
    intents: ['payment', 'money', 'paise', 'dbt', 'bank', 'pay', 'पैसा', 'भुगतान', 'पैसे', 'कब आएगा', 'transfer', 'देयक', 'చెల్లింపు', 'డబ్బు'],
    en: "DBT Payment has 4 stages: 1) Crop Handed Over → 2) Quality Verified → 3) Invoice Generated → 4) DBT Transfer to Bank. Usually takes 3-5 working days after quality check.",
    hi: "DBT भुगतान 4 चरणों में: 1) फसल सौंपी → 2) गुणवत्ता जाँची → 3) Invoice बनी → 4) बैंक में DBT। गुणवत्ता जाँच के 3-5 कार्य दिवसों में पैसे आते हैं।",
    mr: "DBT देयक 4 टप्प्यांत: 1) पीक सुपूर्त → 2) गुणवत्ता तपासणी → 3) Invoice तयार → 4) बँक DBT. गुणवत्ता तपासणीनंतर 3-5 कार्य दिवसांत पैसे येतात.",
    te: "DBT చెల్లింపు 4 దశలు: 1) పంట అప్పగింత → 2) నాణ్యత ధృవీకరణ → 3) ఇన్‌వాయిస్ → 4) బ్యాంక్ DBT. నాణ్యత తనిఖీ తర్వాత 3-5 పని దినాలలో డబ్బు వస్తుంది.",
  },
  {
    intents: ['ivr', 'phone', 'call', 'feature phone', 'फोन', 'कॉल', 'साधारण फोन', 'बिना स्मार्टफोन', 'keypad', 'साधा फोन', 'ఫోన్', 'కాల్'],
    en: "No smartphone? Call 1800-XXX-FARM (Toll-Free) from any phone. Press 1 for English / 2 for Hindi. Enter your mobile number, choose crop, and your Token is confirmed via SMS!",
    hi: "स्मार्टफोन नहीं? किसी भी फोन से 1800-XXX-FARM (टोल-फ्री) कॉल करें। 1=English / 2=Hindi। मोबाइल नंबर दर्ज करें, फसल चुनें, और SMS से टोकन पाएं!",
    mr: "स्मार्टफोन नाही? कोणत्याही फोनवरून 1800-XXX-FARM (टोल-फ्री) कॉल करा. 1=English / 2=Hindi / 3=मराठी. मोबाइल नंबर टाका, पीक निवडा, SMS वर टोकन मिळेल!",
    te: "స్మార్ట్‌ఫోన్ లేదా? ఏ ఫోన్ నుండైనా 1800-XXX-FARM (టోల్-ఫ్రీ) కి కాల్ చేయండి. 1=English / 2=Hindi / 4=తెలుగు. మొబైల్ నంబర్ నమోదు చేయండి, పంట ఎంచుకోండి, SMS లో టోకెన్ వస్తుంది!",
  },
  {
    intents: ['centre', 'location', 'center', 'mandi', 'कहाँ', 'केंद्र', 'मंडी', 'near', 'केंद्र', 'కేంద్రం', 'మండి'],
    en: "Procurement Centres available: Mandi Bhawan (Lucknow), Grain Centre (Varanasi), Agri Hub (Kanpur), Procurement Depot (Agra), State Warehouse (Prayagraj), Rural Centre (Gorakhpur).",
    hi: "उपलब्ध खरीद केंद्र: मंडी भवन (लखनऊ), अनाज केंद्र (वाराणसी), कृषि हब (कानपुर), खरीद डिपो (आगरा), राज्य गोदाम (प्रयागराज), ग्रामीण केंद्र (गोरखपुर)।",
    mr: "उपलब्ध खरेदी केंद्रे: मंडी भवन (लखनौ), धान्य केंद्र (वाराणसी), कृषी हब (कानपूर), खरेदी डेपो (आग्रा), राज्य गोदाम (प्रयागराज), ग्रामीण केंद्र (गोरखपूर).",
    te: "అందుబాటులో ఉన్న సేకరణ కేంద్రాలు: మండి భవన్ (లక్నో), ధాన్యం కేంద్రం (వారణాసి), అగ్రి హబ్ (కాన్పూర్), డిపో (ఆగ్రా), స్టేట్ గోడౌన్ (ప్రయాగ్‌రాజ్), రూరల్ సెంటర్ (గోరఖ్‌పూర్).",
  },
  {
    intents: ['help', 'मदद', 'सहायता', 'guide', 'support', 'क्या', 'what', 'how', 'मदत', 'సహాయం', 'help me'],
    en: "I'm Kisan Mitra 🌾 — your AI farming assistant! I help with: 📅 Slot booking, 🎫 Token status, 💰 Payment tracking, 📞 IVR phone booking, 📍 Centre locations. What do you need help with?",
    hi: "मैं किसान मित्र 🌾 — आपका AI कृषि सहायक! मैं इन विषयों में मदद करता हूँ: 📅 स्लॉट बुकिंग, 🎫 टोकन स्टेटस, 💰 भुगतान ट्रैकिंग, 📞 IVR फोन बुकिंग, 📍 केंद्र स्थान।",
    mr: "मी किसान मित्र 🌾 — तुमचा AI शेती सहायक! मी मदत करतो: 📅 स्लॉट बुकिंग, 🎫 टोकन स्टेटस, 💰 देयक ट्रॅकिंग, 📞 IVR फोन बुकिंग, 📍 केंद्र स्थाने. तुम्हाला काय माहीत करायचे आहे?",
    te: "నేను కిసాన్ మిత్ర 🌾 — మీ AI వ్యవసాయ సహాయకుడు! నేను సహాయం చేస్తాను: 📅 స్లాట్ బుకింగ్, 🎫 టోకెన్ స్టేటస్, 💰 చెల్లింపు ట్రాకింగ్, 📞 IVR ఫోన్ బుకింగ్, 📍 కేంద్ర స్థానాలు. మీకు ఏం కావాలి?",
  },
  {
    intents: ['crop', 'wheat', 'paddy', 'maize', 'फसल', 'गेहूं', 'धान', 'मक्का', 'mustard', 'पीक', 'పంట', 'గోధుమ'],
    en: "Accepted crops: Wheat, Paddy, Maize, Soybean, Mustard, Jowar. MSP rates apply as per government notification.",
    hi: "स्वीकृत फसलें: गेहूं, धान, मक्का, सोयाबीन, सरसों, ज्वार। सरकारी अधिसूचना के अनुसार MSP दर।",
    mr: "स्वीकृत पिके: गहू, भात, मका, सोयाबीन, मोहरी, ज्वारी. सरकारी अधिसूचनेनुसार MSP दर लागू.",
    te: "అంగీకరించిన పంటలు: గోధుమ, వరి, మొక్కజొన్న, సోయాబీన్, ఆవాలు, జొన్న. ప్రభుత్వ నోటిఫికేషన్ ప్రకారం MSP రేట్లు.",
  },
];

app.post('/api/chatbot', (req, res) => {
  const { message = '', language = 'en' } = req.body;
  const lower = message.toLowerCase();

  let matched = null;
  for (const kb of KB) {
    if (kb.intents.some(i => lower.includes(i.toLowerCase()))) { matched = kb; break; }
  }

  const fallbacks = {
    en: "I didn't quite catch that. Try asking about booking, token status, payment, or type 'help'.",
    hi: "क्षमा करें, समझ नहीं पाया। 'मदद' टाइप करें या अपना सवाल दोबारा पूछें।",
    mr: "माफ करा, समजले नाही. 'मदत' टाइप करा किंवा पुन्हा विचारा.",
    te: "క్షమించండి, అర్థం కాలేదు. 'సహాయం' అని టైప్ చేయండి లేదా మళ్ళీ అడగండి.",
  };

  const response = matched
    ? (matched[language] || matched.hi || matched.en)
    : (fallbacks[language] || fallbacks.en);

  res.json({ success: true, response, language });
});


// ---------------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------------
app.get('/api/admin/raw-db', (_req, res) => {
  const slots        = queryAll('SELECT * FROM slots ORDER BY token_number ASC');
  const smsLog       = queryAll('SELECT * FROM sms_log ORDER BY sent_at DESC LIMIT 50');
  const adminActions = queryAll('SELECT * FROM admin_actions ORDER BY performed_at DESC LIMIT 50');
  const appState     = queryAll('SELECT * FROM app_state');

  res.json({
    success: true,
    tables: {
      slots:         { columns: ['id','farmer_name','phone','crop','quantity','center_location','target_date','token_number','source','queue_status','payment_status','created_at'], rows: slots },
      sms_log:       { columns: ['id','phone','message','sent_at'], rows: smsLog },
      admin_actions: { columns: ['id','action_type','target_slot_id','details','performed_at'], rows: adminActions },
      app_state:     { columns: ['key','value'], rows: appState },
    },
  });
});

app.get('/api/admin/stats', (_req, res) => {
  const total     = queryOne('SELECT COUNT(*) as cnt FROM slots')?.cnt || 0;
  const pending   = queryOne("SELECT COUNT(*) as cnt FROM slots WHERE queue_status='pending'")?.cnt || 0;
  const serving   = queryOne("SELECT COUNT(*) as cnt FROM slots WHERE queue_status='serving'")?.cnt || 0;
  const completed = queryOne("SELECT COUNT(*) as cnt FROM slots WHERE queue_status='completed'")?.cnt || 0;
  const ivr       = queryOne("SELECT COUNT(*) as cnt FROM slots WHERE source='IVR / Feature Phone'")?.cnt || 0;
  const app_src   = queryOne("SELECT COUNT(*) as cnt FROM slots WHERE source='Mobile App'")?.cnt || 0;
  const disbursed = queryOne("SELECT COUNT(*) as cnt FROM slots WHERE payment_status='disbursed'")?.cnt || 0;
  res.json({ success: true, data: { total, pending, serving, completed, ivr, app_src, disbursed } });
});

app.get('/api/sms-log', (_req, res) => {
  const rows = queryAll('SELECT * FROM sms_log ORDER BY sent_at DESC LIMIT 20');
  res.json({ success: true, data: rows });
});

// ---------------------------------------------------------------------------
// SSE — /api/events
// ---------------------------------------------------------------------------
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.flushHeaders();

  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));

  const hb = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch { clearInterval(hb); }
  }, 25000);
});

// ---------------------------------------------------------------------------
// AUTH — RBAC Permissions per admin username
// ---------------------------------------------------------------------------
const ADMIN_PERMISSIONS = {
  'admin':      ['queue', 'crop', 'quality', 'invoice', 'payment', 'db', 'users', 'register'],
  'admin2':     ['queue', 'db'],
  'admin3':     ['queue', 'db'],
  'supervisor': ['queue', 'crop', 'quality', 'db'],
  'inspector':  ['quality'],
};

// Permission labels for display
const PERMISSION_LABELS = {
  queue:    '🔄 Queue Management',
  crop:     '🌾 Crop Handover',
  quality:  '🔍 Quality Verification',
  invoice:  '📄 Invoice Generation',
  payment:  '💰 DBT Disbursement',
  db:       '🗄️ Database Viewer',
  users:    '👥 User Management',
  register: '✅ Farmer Registration',
};

// Middleware to check admin permission
function requirePermission(perm) {
  return (req, res, next) => {
    const token = req.headers['x-auth-token'];
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
    try {
      const [role, username] = Buffer.from(token, 'base64').toString().split(':');
      if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
      const perms = ADMIN_PERMISSIONS[username] || [];
      if (!perms.includes(perm)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your role (${username}) does not have permission for: ${PERMISSION_LABELS[perm] || perm}`,
        });
      }
      req.adminUsername = username;
      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
}

// ---------------------------------------------------------------------------
// AUTH — Users (hardcoded admins + registered farmers from DB)
// ---------------------------------------------------------------------------
const ADMIN_USERS = [
  { username: 'admin',      password: 'Admin@2026',   role: 'admin',  displayName: 'DoCA Administrator',       avatar: '🛡️' },
  { username: 'admin2',     password: 'Admin2@2026',  role: 'admin',  displayName: 'District Admin — Lucknow', avatar: '🏛️' },
  { username: 'admin3',     password: 'Admin3@2026',  role: 'admin',  displayName: 'District Admin — Varanasi',avatar: '🏛️' },
  { username: 'supervisor', password: 'Super@2026',   role: 'admin',  displayName: 'Field Supervisor',         avatar: '📋' },
  { username: 'inspector',  password: 'Inspect@2026', role: 'admin',  displayName: 'Quality Inspector',        avatar: '🔍' },
];

// POST /api/auth/register — Farmer self-registration with Aadhaar
app.post('/api/auth/register', (req, res) => {
  const { full_name, aadhaar, phone, password, village = '', district = '', state = 'Uttar Pradesh' } = req.body;

  if (!full_name || !aadhaar || !phone || !password)
    return res.status(400).json({ success: false, message: 'Name, Aadhaar, phone and password are required.' });

  if (!/^\d{12}$/.test(aadhaar))
    return res.status(400).json({ success: false, message: 'Aadhaar must be exactly 12 digits.' });

  if (!/^\d{10}$/.test(phone))
    return res.status(400).json({ success: false, message: 'Phone must be 10 digits.' });

  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

  // Check duplicate Aadhaar
  const existing = queryOne('SELECT id FROM registered_farmers WHERE aadhaar = ?', [aadhaar]);
  if (existing)
    return res.status(409).json({ success: false, message: 'This Aadhaar number is already registered.' });

  const id         = uuidv4();
  const created_at = new Date().toISOString();
  run('INSERT INTO registered_farmers (id, full_name, aadhaar, phone, password, village, district, state, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, full_name, aadhaar, phone, password, village, district, state, created_at]);

  console.log(`🆕 Farmer registered: ${full_name} (Aadhaar: ****${aadhaar.slice(-4)})`);

  // Send welcome SMS
  dispatchSms(phone, `DoCA Kisan Portal: Namaste ${full_name}! Aapka registration safal hua. Aadhaar: ****${aadhaar.slice(-4)}. Ab aap slot book kar sakte hain. Helpline: 1800-XXX-FARM`);

  res.json({ success: true, message: 'Registration successful! You can now login with your Aadhaar number.' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username/Aadhaar and password are required.' });

  const input = username.trim();

  // ── Check admin users first ────────────────────────────────────────────
  const adminUser = ADMIN_USERS.find(
    u => u.username.toLowerCase() === input.toLowerCase() && u.password === password
  );
  if (adminUser) {
    const perms = ADMIN_PERMISSIONS[adminUser.username] || [];
    const token = Buffer.from(`${adminUser.role}:${adminUser.username}:${Date.now()}`).toString('base64');
    console.log(`🔑 Admin login: ${adminUser.displayName} | Perms: [${perms.join(', ')}]`);
    return res.json({
      success: true, token,
      user: {
        username: adminUser.username, role: adminUser.role,
        displayName: adminUser.displayName, avatar: adminUser.avatar,
        permissions: perms,
      },
    });
  }

  // ── Check registered farmers by Aadhaar (12 digits) ────────────────────
  if (/^\d{12}$/.test(input)) {
    const farmer = queryOne('SELECT * FROM registered_farmers WHERE aadhaar = ?', [input]);
    if (farmer && farmer.password === password) {
      const token = Buffer.from(`farmer:${farmer.aadhaar}:${Date.now()}`).toString('base64');
      console.log(`🔑 Farmer login (Aadhaar): ${farmer.full_name}`);
      return res.json({
        success: true, token,
        user: {
          username: farmer.aadhaar, role: 'farmer',
          displayName: farmer.full_name,
          avatar: '👨‍🌾', phone: farmer.phone,
          permissions: [],
        },
      });
    }
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials. Farmers must use their 12-digit Aadhaar number.' });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out.' });
});

// GET /api/auth/users — admin list + registered farmers (no passwords)
app.get('/api/auth/users', (_req, res) => {
  const admins = ADMIN_USERS.map(u => ({
    username: u.username, displayName: u.displayName,
    avatar: u.avatar, role: u.role,
    permissions: ADMIN_PERMISSIONS[u.username] || [],
  }));
  const dbFarmers = queryAll('SELECT id, full_name, aadhaar, phone, village, district, state, created_at FROM registered_farmers ORDER BY created_at DESC');
  const farmers = dbFarmers.map(f => ({
    username: f.aadhaar, displayName: f.full_name,
    avatar: '👨‍🌾', role: 'farmer',
    phone: f.phone, village: f.village, district: f.district,
    aadhaarHint: `****${f.aadhaar.slice(-4)}`,
  }));
  res.json({ success: true, admins, farmers, permissionLabels: PERMISSION_LABELS });
});

// GET /api/auth/permissions — get permission labels
app.get('/api/auth/permissions', (_req, res) => {
  res.json({ success: true, data: PERMISSION_LABELS });
});


// ---------------------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------------------
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌾 DoCA Procurement API  →  http://localhost:${PORT}`);
    console.log(`📦 Database              →  ${DB_PATH}`);
    console.log(`📡 SSE stream            →  http://localhost:${PORT}/api/events`);
    console.log(`🤖 Chatbot               →  POST http://localhost:${PORT}/api/chatbot`);
    console.log(`📞 IVR booking           →  POST http://localhost:${PORT}/api/slots/ivr`);
    console.log('─'.repeat(58));
  });
}).catch(e => {
  console.error('Failed to initialise database:', e);
  process.exit(1);
});
