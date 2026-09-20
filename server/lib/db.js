const { DatabaseSync } = require('node:sqlite');

const INVITATION_KEY = 'invitation';
const MAX_WISHES = 500;
const DATE_TIME_ZONE = 'Asia/Tashkent';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: DATE_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

function todayLabel(now = new Date()) {
  return dateFormat.format(now).replace(/\//g, '.');
}

function openStore(file) {
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS wishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      text TEXT NOT NULL
    );
  `);

  const selectInvitation = db.prepare('SELECT value FROM kv WHERE key = ?');
  const upsertInvitation = db.prepare(
    'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const deleteInvitation = db.prepare('DELETE FROM kv WHERE key = ?');
  const selectWishes = db.prepare('SELECT id, name, date, text FROM wishes ORDER BY id ASC');
  const countWishes = db.prepare('SELECT COUNT(*) AS n FROM wishes');
  const insertWish = db.prepare('INSERT INTO wishes (name, date, text) VALUES (?, ?, ?)');
  const removeWish = db.prepare('DELETE FROM wishes WHERE id = ?');
  const removeAllWishes = db.prepare('DELETE FROM wishes');

  return {
    getInvitation() {
      const row = selectInvitation.get(INVITATION_KEY);
      return row ? JSON.parse(row.value) : null;
    },
    saveInvitation(data) {
      upsertInvitation.run(INVITATION_KEY, JSON.stringify(data));
    },
    listWishes() {
      return selectWishes.all();
    },
    // Returns null when the wish cap is reached.
    addWish({ name, text }) {
      if (countWishes.get().n >= MAX_WISHES) return null;
      const date = todayLabel();
      const result = insertWish.run(name, date, text);
      return { id: Number(result.lastInsertRowid), name, date, text };
    },
    deleteWish(id) {
      return removeWish.run(id).changes > 0;
    },
    reset() {
      deleteInvitation.run(INVITATION_KEY);
      removeAllWishes.run();
    },
    close() {
      db.close();
    }
  };
}

module.exports = { openStore, todayLabel, MAX_WISHES };
