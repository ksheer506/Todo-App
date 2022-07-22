import { StoreDB, TagDB, TaskDB } from "../../interfaces/db";

const userTodoV2 = [
  {name: "task", keyPath: "id"},
  {name: "tagList", keyPath: "tagText"}
]

interface IDBIndex {
  name: string;
  isUnique: boolean;
}

interface UpgradeNeededDB {
  name: string;
  keyPath: string;
  indexes?: Array<IDBIndex>;
}

export function openIDB(
  name: string,
  version: number,
  newVersionInfo: Array<UpgradeNeededDB> = userTodoV2
): Promise<IDBDatabase> {
  const dbRequest = indexedDB.open(name, version);

  return new Promise((resolve, reject) => {
    dbRequest.onupgradeneeded = () => {
      const db = dbRequest.result;

      upgradeIDB(db, newVersionInfo);
      resolve(db);
    };

    dbRequest.onsuccess = () => {
      resolve(dbRequest.result);
    };

    dbRequest.onerror = () => {
      /* reject("Failed to load DB"); */
    };
  });
} // db 반환

function upgradeIDB(db: IDBDatabase, objectStores: Array<UpgradeNeededDB>) {
  // FIXME: objectStore가 이미 존재할 때 업그레이드 필요할 경우, 처리 방법
  objectStores.forEach((os) => {
    const { name, keyPath, indexes } = os;
    const objectStore = db.createObjectStore(name, { keyPath: keyPath });

    if (indexes?.length) {
      indexes.forEach((idx) => {
        const { name, isUnique } = idx;

        objectStore.createIndex(name, name, { unique: isUnique });
      });
    }
  });
}

const db = openIDB("user-Todo", 2);

/* IndexedDB에 저장된 데이터를 불러오는 함수 */
async function fetchAllDB(storeName: Array<keyof StoreDB> = ["tagList", "task"]): Promise<[TagDB[], TaskDB[]]> {
  const transaction = (await db).transaction(storeName);

  const storeData = storeName.map(<T extends string>(store: T) => {
    const objectStore = transaction.objectStore(store);
    const fetchReq: IDBRequest = objectStore.getAll();

    return new Promise<StoreDB[T & keyof StoreDB]>((resolve) => {
      fetchReq.onsuccess = () => {
        resolve(fetchReq.result);
      };
    });
  });

  return Promise.all(storeData);

}


export async function openTransaction(storeName: string) {
  const transaction = (await db).transaction(storeName);
  const objectStore = transaction.objectStore(storeName);
}


export { db, fetchAllDB };
