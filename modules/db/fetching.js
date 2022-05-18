import { db } from "./initialLoad.js"

/* 태그 배열을 받아 해당 태그가 indexedDB에 존재하는지 검색하고, 그 결과를 반환하는 함수 */
// keyArray = [{"tag": "태그1", "assignedTask": ["id_1", "id_2"]}, ...] 또는 ["태그1", "태그2", ...]
function isTagExistInDB(keyArray) {
  const transaction = db.transaction('tagList');
  const tagObjectStore = transaction.objectStore('tagList');
  const searchRequests = [];
  const resultPromises = [];

  keyArray.forEach((key, i) => {
    let tag = key.tag || key;

    searchRequests[i] = tagObjectStore.get(tag);
    resultPromises[i] = new Promise((resolve) => {
      searchRequests[i].onsuccess = (e) => { // 검색 결과가 없을 경우 결과값 undefined로 onsuccess 실행
        resolve(e.target.result || null);
      };
    });
  });
  return Promise.all(resultPromises);
  // DB에 존재: [{"tag": "태그1", "assignedTask": ["id_1", "id_2"]}, ...],
  // DB에 없음: null 반환
}

/* 해당 Tag를 전부 가지고 있는 Task의 id를 반환하는 함수 */
async function isTaskHasTag(tagArray) { // taskArray를 입력받지 않으면 해당 Tag를 가진 모든 Task 배열을 반환
  if (!Array.isArray(tagArray)) return;

  const fetchResult = await isTagExistInDB(tagArray);

  return fetchResult.reduce((accu, next, i) => {
    if (i === 0) { return next.assignedTask; }
    if (!next.length) return [];
    return next.assignedTask.filter((taskId) => accu.includes(taskId));
  }, []);
}

export { isTagExistInDB, isTaskHasTag }
