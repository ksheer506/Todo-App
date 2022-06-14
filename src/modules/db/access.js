import { db } from "./initialLoad.js"

/* "task" ObjectStore 수정 함수 */
function accessTaskDB(operation, targetTaskObj) {
  if (typeof (targetTaskObj) !== 'object') return;

  const transaction = db.transaction(['task'], 'readwrite');
  const taskObjectStore = transaction.objectStore('task');
  let operationRequest;

  switch (operation) {
    case 'ADD':
      operationRequest = taskObjectStore.add(targetTaskObj);
      break;
    case 'DELETE':
      operationRequest = taskObjectStore.delete(targetTaskObj.id);
      break;
    case 'MODIFY':
      operationRequest = taskObjectStore.put(targetTaskObj);
      break;
  }
  operationRequest.onsuccess = () => { };
}

/* "tagList" ObjectStore 수정 함수 */
function accessTagDB(operation, array) { // array = [ {tag: "", assignedTask : []}, ... ]
  if (!Array.isArray(array)) return;

  const transaction = db.transaction(['tagList'], 'readwrite');
  const tagListObjectStore = transaction.objectStore('tagList');
  const operationRequest = [];
  let resultLog;

  switch (operation) {
    case 'ADD':
      array.forEach((tagObj, index) => {
        operationRequest[index] = tagListObjectStore.add(tagObj);
      });
      resultLog = '성공적으로 태그를 추가했습니다.';
      break;
    case 'DELETE':
      array.forEach((tagObj, index) => {
        operationRequest[index] = tagListObjectStore.delete(tagObj.tag);
      });
      resultLog = '성공적으로 태그를 제거했습니다.';
      break;
    case 'MODIFY':
      array.forEach((tagObj, index) => {
        operationRequest[index] = tagListObjectStore.put(tagObj);
      });
      resultLog = '성공적으로 태그를 업데이트했습니다.';
      break;
  }
  transaction.onsuccess = () => { console.log(`${resultLog}: "${operationRequest.result}"`); };
  transaction.onerror = (e) => { e.preventDefault(); };
}

export { accessTaskDB, accessTagDB }