import { StoreDB, StoreNames, TagDB, TaskDB } from "../../interfaces/db";
import { db } from "./initialLoad";


/* 태그 배열을 받아 해당 태그가 indexedDB에 존재하는지 검색하고, 그 결과를 반환 */
async function fetchAssignedTasks(keyArray: Array<string>) {
  const transaction = (await db).transaction("tagList");
  const tagObjectStore = transaction.objectStore("tagList");
  const resultPromises: Array<Promise<TagDB>> = [];

  keyArray.forEach((key, i) => {
    resultPromises[i] = new Promise((resolve) => {
      tagObjectStore.get(key).onsuccess = (e) => {
        // 검색 결과가 없을 경우 결과값 undefined로 onsuccess 실행
        if (!e.target) return;

        resolve((e.target as IDBRequest).result);
      };
    });
  });
  return Promise.all(resultPromises);
  // DB에 존재: [{"tagText": "태그1", "assignedTask": ["id_1", "id_2"]}, ...],
  // DB에 없음: null
}

type ArrayKeys<T> = {
  [P in keyof T]: T[P] extends Array<any> ? P : never;
}[keyof T];

async function FilterByTagsDB(
  tagArray: Array<string>,
  filterKey: ArrayKeys<TagDB> = "assignedTask"
) {
  const fetchResult = await fetchAssignedTasks(tagArray);
  const initial: Array<string> = [];

  return fetchResult.reduce((accu, next, i) => {
    if (i < 1) return next[filterKey];
    if (!next[filterKey]?.length) return [];

    return next[filterKey].filter((taskId) => accu.includes(taskId));
  }, initial);
}

async function fetchDataFromId<T extends string>(IDs: Array<string>, storeName: T) {
  const transaction = (await db).transaction(storeName);
  const objectStore = transaction.objectStore(storeName);
  const resultPromises: Array<Promise<StoreDB[T & StoreNames]>> = [];

  IDs.forEach((key, i) => {
    resultPromises[i] = new Promise((resolve) => {
      objectStore.get(key).onsuccess = (e) => {
        // 검색 결과가 없을 경우 결과값 undefined로 onsuccess 실행
        if (!e.target) return;

        resolve((e.target as IDBRequest).result);
      };
    });
  });
  return Promise.all(resultPromises);
}

async function fetchAllData(storeName: Array<keyof StoreDB>) {
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

export { fetchAssignedTasks, FilterByTagsDB, fetchAllData };


