import { TagDB } from "../../interfaces/db";
import { db } from "./initialLoad";

interface tagKey {
  tagText: string;
  assignedTask: Array<string>;
}

type tagString = string;

/* 태그 배열을 받아 해당 태그가 indexedDB에 존재하는지 검색하고, 그 결과를 반환 */
// keyArray = [{"tag": "태그1", "assignedTask": ["id_1", "id_2"]}, ...] 또는 ["태그1", "태그2", ...]
function fetchAssignedTasks(keyArray: Array<string>) {
  const transaction = db.transaction("tagList");
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

async function FilterByTagsDB(tagArray: Array<string>, filterKey: ArrayKeys<TagDB> = "assignedTask") {
  // taskArray를 입력받지 않으면 해당 Tag를 가진 모든 Task 배열을 반환
  const fetchResult = await fetchAssignedTasks(tagArray);
  const initial: Array<string> = [];

  return fetchResult.reduce((accu, next, i) => {
    if (i < 1) return next[filterKey];
    if (!accu[filterKey]?.length) return [];

    return next[filterKey].filter((taskId) => accu.includes(taskId));
  }, initial);
}

export { FilterByTagsDB };
