import { db } from "./initialLoad"

/* 태그 배열을 받아 해당 태그가 indexedDB에 존재하는지 검색하고, 그 결과를 반환 */
// keyArray = [{"tag": "태그1", "assignedTask": ["id_1", "id_2"]}, ...] 또는 ["태그1", "태그2", ...]
function isTagExistInDB(keyArray) {
  console.log(db);
  const transaction = db.transaction('tagList');
  const tagObjectStore = transaction.objectStore('tagList');
  const resultPromises = [];

  keyArray.forEach((key, i) => {
    let tag = key.tag || key;

    resultPromises[i] = new Promise((resolve) => {
      tagObjectStore.get(tag).onsuccess = (e) => { // 검색 결과가 없을 경우 결과값 undefined로 onsuccess 실행
        resolve(e.target.result || null);
      };
    });
  });
  return Promise.all(resultPromises);
  // DB에 존재: [{"tagText": "태그1", "assignedTask": ["id_1", "id_2"]}, ...],
  // DB에 없음: null 
}

/* 해당 Tag를 전부 가지고 있는 Task의 id 배열을 반환 */
async function FilterByTagsDB(tagArray, filterKey = "assignedTask") { // taskArray를 입력받지 않으면 해당 Tag를 가진 모든 Task 배열을 반환
  if (!Array.isArray(tagArray)) {
    throw new Error("parameter 1 should be an Array.")
  };
  console.log(tagArray);

  const fetchResult = await isTagExistInDB(tagArray);
  const initValue = fetchResult[0][filterKey];

  return fetchResult.reduce((accu, next, i) => {
    if (!accu.length || !next.length) return [];

    return next[filterKey].filter((taskId) => accu.includes(taskId));
  }, initValue);
}

export { FilterByTagsDB }
