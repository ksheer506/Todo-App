import rootRender from '../../index.js'

let db;

/* IndexedDB에 저장된 데이터를 불러오는 함수 */
function loadIndexedDB() {
  const transaction = db.transaction(['task', 'tagList']);
  const taskObjectStore = transaction.objectStore('task'); // A. Task 가져오기
  const taskFetchRequest = taskObjectStore.getAll();
  const tagObjectStore = transaction.objectStore('tagList'); // B. 태그 리스트 목록 가져오기
  const tagFetchRequest = tagObjectStore.getAll();

  const taskReq = new Promise((resolve) => {
    taskFetchRequest.onsuccess = () => { // C-1. "Task" ObjectStore 로드 후 작업
      resolve(taskFetchRequest.result)
    };
  });
  const tagReq = new Promise((resolve) => {
    tagFetchRequest.onsuccess = () => { // C-2. "TagList" ObjectStore 로드 후 작업
      resolve(tagFetchRequest.result)
    };
  });

  Promise.all([taskReq, tagReq])
    .then((resArr) => rootRender(...resArr))
}

/* Task 데이터 저장에 indexedDB 이용 */
const dbRequest = indexedDB.open('user-Todo', 1);

dbRequest.onupgradeneeded = () => {
  db = dbRequest.result;

  // "task" Object Store 생성
  const taskObjectStore = db.createObjectStore('task', { keyPath: 'id' });
  db.createObjectStore('tagList', { keyPath: 'tagText' });

  // Index 생성
  taskObjectStore.createIndex('title', 'title', { unique: false });
  taskObjectStore.createIndex('isCompleted', 'isCompleted', { unique: false });
  taskObjectStore.createIndex('dueDate', 'dueDate', { unique: false });
  taskObjectStore.createIndex('tags', 'tags', { unique: false });
};

dbRequest.onsuccess = () => {
  db = dbRequest.result;

  loadIndexedDB();
};

dbRequest.onerror = () => { throw new Error("Failed to load DB")};

export { db }; 
