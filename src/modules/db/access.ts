import { db } from "./initialLoad";
import { taskDB, tagDB } from "../../interfaces";

type operation = "ADD" | "MODIFY" | "DELETE";

/* "task" ObjectStore 수정 함수 */
function accessTaskDB(operation: operation, targetTaskObj: taskDB) {
  const transaction = db.transaction(["task"], "readwrite");
  const taskObjectStore = transaction.objectStore("task");
  let operationRequest!: IDBRequest;

  switch (operation) {
    case "ADD":
      operationRequest = taskObjectStore.add(targetTaskObj);
      break;
    case "DELETE":
      operationRequest = taskObjectStore.delete(targetTaskObj.id);
      break;
    case "MODIFY":
      operationRequest = taskObjectStore.put(targetTaskObj);
      break;
    default:
    // default
  }

  operationRequest.onerror = (e) => {
    console.log(e);
  };
}

/* "tagList" ObjectStore 수정 함수 */
function accessTagDB(operation: operation, array: Array<tagDB>) {
  const transaction = db.transaction(["tagList"], "readwrite");
  const tagListObjectStore = transaction.objectStore("tagList");
  const operationRequest: Array<IDBRequest> = [];
  let resultLog: string;

  switch (operation) {
    case "ADD":
      array.forEach((tagObj, i) => {
        operationRequest[i] = tagListObjectStore.add(tagObj);
      });
      resultLog = "성공적으로 태그를 추가했습니다.";
      break;
    case "DELETE":
      array.forEach((tagObj, i) => {
        operationRequest[i] = tagListObjectStore.delete(tagObj.tagText);
      });
      resultLog = "성공적으로 태그를 제거했습니다.";
      break;
    case "MODIFY":
      array.forEach((tagObj, i) => {
        operationRequest[i] = tagListObjectStore.put(tagObj);
      });
      resultLog = "성공적으로 태그를 업데이트했습니다.";
      break;
    default:
      throw new Error(
        "parameter 1 should be one of 'ADD', 'DELETE', and 'MODIFY'"
      );
  }

  transaction.onerror = (e) => {
    e.preventDefault();
  };
}

export { accessTaskDB, accessTagDB };
