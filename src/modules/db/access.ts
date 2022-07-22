import { TaskDB, TagDB, Identified } from "../../interfaces/db";
import { Operations } from "../../interfaces/db";
import { openIDB } from "./initialLoad";

const db = openIDB("user-Todo", 2);

/* "task" ObjectStore 수정 함수 */
async function accessTaskDB(operation: Operations, targetTaskObj: TaskDB) {
  const transaction = (await db).transaction(["task"], "readwrite");
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
async function accessTagDB(operation: Operations, array: Array<TagDB>) {
  const transaction = (await db).transaction(["tagList"], "readwrite");
  const tagListObjectStore = transaction.objectStore("tagList");
  const operationRequest: Array<IDBRequest> = [];
  let resultLog: string;

  switch (operation) {
    case "ADD":
      array.forEach((tagObj, i) => {
        operationRequest[i] = tagListObjectStore.add(tagObj);
      });
      break;
    case "DELETE":
      array.forEach((tagObj, i) => {
        operationRequest[i] = tagListObjectStore.delete(tagObj.tagText);
      });
      break;
    case "MODIFY":
      array.forEach((tagObj, i) => {
        operationRequest[i] = tagListObjectStore.put(tagObj);
      });
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

async function accessDB<T extends Identified>(objectStore: string, operation: Operations, array: Array<T>) {
  const transaction = (await db).transaction(objectStore, "readwrite");
  const tagListObjectStore = transaction.objectStore(objectStore);
  const operationRequest: Array<IDBRequest> = [];

  switch (operation) {
    case "ADD":
      array.forEach((el, i) => {
        operationRequest[i] = tagListObjectStore.add(el);
      });
      break;
    case "DELETE":
      array.forEach((el, i) => {
        operationRequest[i] = tagListObjectStore.delete(el.id);
      });
      break;
    case "MODIFY":
      array.forEach((el, i) => {
        operationRequest[i] = tagListObjectStore.put(el);
      });
      break;
    default:
      throw new Error("parameter 1 should be one of 'ADD', 'DELETE', and 'MODIFY'");
  }

  transaction.onerror = (e) => {
    e.preventDefault();
  };
}

export { accessTaskDB, accessTagDB, accessDB };
