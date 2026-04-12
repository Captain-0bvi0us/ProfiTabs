import { openDB } from 'idb';

const DB_NAME = 'profitabs-offline';
const DB_VERSION = 2;
const STORE_TABS = 'tabs';

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(STORE_TABS, { keyPath: 'id', autoIncrement: true });
        store.createIndex('instrument', 'instrument');
        store.createIndex('updated_at', 'updated_at');
      }
      if (oldVersion < 2 && !db.objectStoreNames.contains(STORE_TABS)) {
        const store = db.createObjectStore(STORE_TABS, { keyPath: 'id', autoIncrement: true });
        store.createIndex('instrument', 'instrument');
        store.createIndex('updated_at', 'updated_at');
      }
    },
  });
}

export async function saveTab(tab) {
  const db = await getDB();
  const now = new Date().toISOString();
  const record = {
    ...tab,
    updated_at: now,
    created_at: tab.created_at || now,
  };
  const id = await db.put(STORE_TABS, record);
  return { ...record, id };
}

export async function getTab(id) {
  const db = await getDB();
  return db.get(STORE_TABS, id);
}

export async function getAllTabs() {
  const db = await getDB();
  const all = await db.getAll(STORE_TABS);
  return all.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

export async function deleteTab(id) {
  const db = await getDB();
  await db.delete(STORE_TABS, id);
}

const EXPORT_FORMAT_VERSION = 1;

export function exportTabToJSON(tab) {
  const payload = {
    formatVersion: EXPORT_FORMAT_VERSION,
    title: tab.title,
    artist: tab.artist || '',
    instrument: tab.instrument,
    tempo: tab.tempo,
    time_signature_top: tab.time_signature_top,
    time_signature_bottom: tab.time_signature_bottom,
    tuning: tab.tuning || [],
    data: tab.data,
    created_at: tab.created_at,
    exported_at: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

export function parseImportedJSON(jsonString) {
  const obj = JSON.parse(jsonString);

  if (!obj.title || !obj.instrument || !obj.data?.measures) {
    throw new Error('Некорректный формат файла: отсутствуют обязательные поля');
  }

  const validInstruments = ['guitar', 'electric', 'bass', 'drums'];
  if (!validInstruments.includes(obj.instrument)) {
    throw new Error(`Неизвестный инструмент: ${obj.instrument}`);
  }

  return {
    title: obj.title,
    artist: obj.artist || '',
    instrument: obj.instrument,
    tempo: obj.tempo || 120,
    time_signature_top: obj.time_signature_top || 4,
    time_signature_bottom: obj.time_signature_bottom || 4,
    tuning: obj.tuning || [],
    data: obj.data,
  };
}

export async function importTab(parsedTab) {
  return saveTab(parsedTab);
}
