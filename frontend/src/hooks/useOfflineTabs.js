import { openDB } from 'idb';

const DB_NAME = 'profitabs-offline';
const DB_VERSION = 1;
const STORE_TABS = 'tabs';

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_TABS)) {
        const store = db.createObjectStore(STORE_TABS, { keyPath: 'id' });
        store.createIndex('instrument', 'instrument');
        store.createIndex('updated_at', 'updated_at');
      }
    },
  });
}

export async function saveTabOffline(tab) {
  const db = await getDB();
  await db.put(STORE_TABS, tab);
}

export async function getTabOffline(id) {
  const db = await getDB();
  return db.get(STORE_TABS, id);
}

export async function getAllTabsOffline() {
  const db = await getDB();
  const all = await db.getAll(STORE_TABS);
  return all.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

export async function deleteTabOffline(id) {
  const db = await getDB();
  await db.delete(STORE_TABS, id);
}

export async function syncTabsToOffline(tabs) {
  const db = await getDB();
  const tx = db.transaction(STORE_TABS, 'readwrite');
  for (const tab of tabs) {
    await tx.store.put(tab);
  }
  await tx.done;
}
