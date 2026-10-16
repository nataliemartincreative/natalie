/**
 * Minimal IndexedDB blob store for files too large for localStorage
 * (dielines, artwork). Browser-only.
 */
const DB_NAME = "nfwe-files";
const STORE = "files";

let dbPromise: Promise<IDBDatabase> | undefined;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const request = op(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const putFile = (key: string, blob: Blob) => run("readwrite", (s) => s.put(blob, key));
export const getFile = (key: string) => run<Blob | undefined>("readonly", (s) => s.get(key));
export const deleteFile = (key: string) => run("readwrite", (s) => s.delete(key));

export const dielineKey = (projectId: string) => `dieline:${projectId}`;
