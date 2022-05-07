class Todo {
  constructor(object) {
    this.id = object.id || `id_${Date.now()}`;
    this.title = object.title;
    this.isCompleted = object.isCompleted || false;
    this.dueDate = object.dueDate || "";
    this.text = object.text || "";
    this.tags = object.tags || [];
  }

  /* TODO: React 이용 */
  createTaskNode() {
    // 체크박스 만들기
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // 체크박스 라벨 만들기
    const taskDiv = document.createElement("div");
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(document.createTextNode(this.title));
    taskDiv.classList.add("task-label");

    // 제거 버튼 만들기
    const close = document.createElement("div");
    close.appendChild(document.createTextNode("x"));
    close.className = "close";
    close.setAttribute("tabIndex", "0");

    // 태그 만들기
    const tagDiv = document.createElement("div");
    tagDiv.className = "task-tags";

    // 오른쪽 추가 정보(만료일, 닫기 버튼) 만들기
    const extraDiv = document.createElement("div");

    // 만료일자가 있을 때 만료일 만들기
    const dateLabel = document.createElement("label");
    const dateChanger = document.createElement("input");  // 만료일 수정 input element
    dateLabel.setAttribute("for", "datepicker");
    dateChanger.type = "date";
    dateChanger.id = "datepicker";
    dateLabel.className = "dueDate";
    dateLabel.appendChild(dateChanger);

    if (this.dueDate) {  // label에 만료일 표시
      dateLabel.appendChild(document.createTextNode(this.dueDate));
      dateLabel.value = `${this.dueDate}`;
    }
    extraDiv.appendChild(dateLabel);
    extraDiv.appendChild(close);
    extraDiv.className = "extra";

    // 모든 요소 묶기
    const div = document.createElement("div");
    div.appendChild(taskDiv);
    div.appendChild(tagDiv);
    div.appendChild(extraDiv);
    div.id = this.id;
    div.className = "task";

    return div;
  }

  toggleCompletion() {
    const toggle = this.isCompleted ? false : true;
    this.isCompleted = toggle;
    console.log(this.isCompleted);
  }

  addNewTag(tag) {
    this.tags.push(tag);
  }
}

/* Task 데이터 저장에 indexedDB 이용 */
let db;
const dbRequest = indexedDB.open("user-Todo", 1);

dbRequest.onupgradeneeded = (e) => {
  db = dbRequest.result;

  // "task" Object Store 생성
  let taskObjectStore = db.createObjectStore("task", { keyPath: "id" });
  let tagObjectStore = db.createObjectStore("tagList", { keyPath: "tag" });

  // Index 생성
  taskObjectStore.createIndex("title", "title", { unique: false });
  taskObjectStore.createIndex("isCompleted", "isCompleted", { unique: false });
  taskObjectStore.createIndex("dueDate", "dueDate", { unique: false });
  taskObjectStore.createIndex("tags", "tags", { unique: false });
  console.log("indexedDB 초기화: Success");
}

dbRequest.onsuccess = (e) => {
  db = dbRequest.result;
  console.log("indexedDB 로드: Success");
  loadIndexedDB();
}

dbRequest.onerror = (e) => { }

/* indexedDB에서 primary key 또는 index를 통해 원하는 Task를 찾는 함수 */
function findTaskDB(key, value) {   // TODO: parameter로 object를 받아 검색할 수 았도록 수정
  let transaction = db.transaction("task");
  let taskObjectStore = transaction.objectStore("task");
  let searchRequest

  if (key === "id") {
    searchRequest = taskObjectStore.get(value);
  }
  else {
    searchRequest = taskObjectStore.index(key).getAll(value);
  }

  return new Promise((resolve, reject) => {
    searchRequest.onsuccess = (e) => {
      console.log("DB 검색 결과: Success");
      resolve(e.target.result);
    }
  })
}

/* 태그 배열을 받아 해당 태그가 indexedDB에 존재하는지 검색하고, 그 결과를 반환하는 함수 */
function isTagExistInDB(keyArray) {
  // keyArray = [{"tag": "태그1", "assignedTask": ["id_1", "id_2"]}, ...] 또는 ["태그1", "태그2", ...] 
  let transaction = db.transaction("tagList");
  let tagObjectStore = transaction.objectStore("tagList");
  let searchRequests = [];
  let resultPromises = [];

  keyArray.forEach((key, index) => {
    const tag = key.tag ? key.tag : key;

    searchRequests[index] = tagObjectStore.get(tag);
    resultPromises[index] = new Promise((resolve, reject) => {
      searchRequests[index].onsuccess = (e) => {  // 검색 결과가 없을 경우 결과값 undefined로 onsuccess 실행
        const searchResult = e.target.result || null;
        console.log("DB 검색 결과: Success");
        resolve(searchResult);
      }
    })
  })
  return Promise.all(resultPromises);  // DB에 존재: undefined, DB에 없음: 헤당 객체 그대로 반환
}

/* 해당 Tag를 전부 가지고 있는 Task의 id를 반환하는 함수 */
async function isTaskHasTag(tagArray) {  // taskArray를 입력받지 않으면 해당 Tag를 가진 모든 Task 배열을 반환
  if (!Array.isArray(tagArray)) {
    console.log("입력된 argument가 배열이 아닙니다.");
    return;
  }
  const fetchResult = await isTagExistInDB(tagArray);

  return fetchResult.reduce((accu, next, index) => {
    if (index === 0) { return next.assignedTask; }
    if (!next.length) return [];
    return next.assignedTask.filter(taskId => accu.includes(taskId));
  }, [])
}

/* function dbCursor() {
  let transaction = db.transaction(["task"], "readwrite");
  let taskObjectStore = transaction.objectStore("task");
  let taskCursor = taskObjectStore.openCursor();

  taskCursor.onsuccess = (e) => {
    let cursor = e.target.result;
    console.log(cursor);
    cursor.continue();
  }
} */

/* "task" IndexedDB 수정 함수 */
function accessTaskDB(operation, targetTaskObj) {
  if (typeof (targetTaskObj) !== "object") return;

  let transaction = db.transaction(["task"], "readwrite");
  let taskObjectStore = transaction.objectStore("task");
  let operationRequest;
  let resultLog;

  switch (operation) {
    case "add":
      operationRequest = taskObjectStore.add(targetTaskObj);
      resultLog = "성공적으로 할일을 추가했습니다.";
      break;
    case "delete":
      operationRequest = taskObjectStore.delete(targetTaskObj.id);
      resultLog = "성공적으로 할일을 제거했습니다.";
      break;
    case "modify":
      operationRequest = taskObjectStore.put(targetTaskObj);
      resultLog = "성공적으로 할일을 수정했습니다.";
      break;
  }
  operationRequest.onsuccess = () => { console.log(resultLog); }
}

/* "tagList" IndexedDB 수정 함수 */
function accessTagDB(operation, array) { // array = [ {tag: "", assignedTask : []}, ... ]
  if (!Array.isArray(array)) return;

  let transaction = db.transaction(["tagList"], "readwrite");
  let tagListObjectStore = transaction.objectStore("tagList");
  let operationRequest = [];

  switch (operation) {
    case "add":
      array.forEach((tagObj, index) => {
        operationRequest[index] = tagListObjectStore.add(tagObj);
      })
      resultLog = "성공적으로 태그를 추가했습니다.";
      break;
    case "delete":
      array.forEach((tagObj, index) => {
        operationRequest[index] = tagListObjectStore.delete(tagObj.tag);
      })
      resultLog = "성공적으로 태그를 제거했습니다.";
      break;
    case "put":
      array.forEach((tagObj, index) => {
        operationRequest[index] = tagListObjectStore.put(tagObj);
      })
      resultLog = "성공적으로 태그를 업데이트했습니다.";
      break;
  }
  transaction.onsuccess = () => { console.log(`${resultLog}: "${operationRequest.result}"`); };
  transaction.onerror = (e) => { e.preventDefault(); };
}

/* 함수 accessTagDB()의 argument인 key-value 객체 배열을 만드는 함수 */
function createTagKeyArr(tagArray) {
  return tagArray.map((tag) => ({ "tag": `#${tag}`, "assignedTask": [] }));
}

async function findTaskFromElement(element) {
  let taskTitle;
  if (element.classList.match("task-label"))
    taskTitle = element.querySelector(".task-label").innerText;
  let resultTodo = await findTaskDB("title", taskTitle);

  if (resultTodo.length <= 1) return resultTodo[0];

  return new Error("검색 결과가 없거나 여러 개 존재합니다.")  // FIXME: 결과가 2개 이상 나올 때 처리
  /* const taskDueDate = element.querySelector("p.dueDate").innerText;
  let taskTags = element.querySelector(".task-label").innerText; // tag로 검색하는 방법?
  resultTodo = await findTaskDB("dueDate", taskDueDate);
  console.log(resultTodo); */
}

/* async function fetchDBFromTaskId(id) {
  return await findTaskDB("id", id);
}
 */
/* Task Element(div.task)를 완료 여부에 따라 이동시키는 함수 */
function moveTaskElement(taskElement, destClassName) {
  const destElement = document.querySelector(`section.${destClassName}`)

  destElement.appendChild(taskElement);

  if (destClassName === "ongoing") { // 미완료된 할일일 경우
    taskElement.querySelector("input").removeAttribute("checked");
  }
  else if (destClassName === "completed") { // 완료된 할일일 경우
    taskElement.querySelector("input").setAttribute("checked", "1");
  }
}

/* 새 Task 생성 함수 */
function addNewTask(todoTitle, _dueDate) {
  if (!todoTitle) {
    alert("할 일을 입력해주세요.");
    return;
  }

  const newTaskParam = { title: todoTitle, dueDate: _dueDate };
  const newTask = new Todo(newTaskParam);

  const element = newTask.createTaskNode();
  moveTaskElement(element, "ongoing");
  accessTaskDB("add", newTask); // DB에 할일 추가
}

/* 지정 위치에 Tag Node를 만드는 함수 */
async function createTagNode(targetNode, tagArray, ...userOptions) {
  let filteredTagArray = tagArray;
  let options = { makeCheckbox: false, initialLoad: false, ...userOptions[0] };

  if (targetNode.className === "tag-list" && !options.initialLoad) {  // 중복된 태그 생성을 막기 위해 indexedDB에 존재하는 태그를 제외한 배열을 만듦
    const searchResult = await isTagExistInDB(tagArray);

    filteredTagArray = tagArray.reduce((accu, nextObj, index) => {
      if (!searchResult[index]) { accu.push(nextObj.tag); }
      return accu;
    }, []);
  }

  filteredTagArray.forEach((_tag) => {  // TODO: 태그 리스트에 추가하는 경우, 각 Task에 태그를 추가하는 경우 함수 나누기
    const newTag = document.createElement("label");
    newTag.appendChild(document.createTextNode(_tag));
    newTag.className = "tags";

    if (options.makeCheckbox) {  // 태그별 Task 필터링을 위한 체크박스 생성
      const tagCheckbox = document.createElement("input");
      tagCheckbox.type = "checkbox";
      newTag.appendChild(tagCheckbox);
    }
    targetNode.appendChild(newTag);
  })
}

/* 해당 위치의 Tag Node를 삭제하는 함수(DB에서도 삭제) */
// tagArray = ["태그1", "태그2", ...], 모든 태그를 삭제할 경우 []로 지정
async function deleteTagNode(targetNode, tagArray, ...userOptions) {
  const allTagNodes = targetNode.querySelectorAll(".tags");
  let targetTags = tagArray;
  let options = { clearDB: true, ...userOptions[0] };
  let tagKeyValue = [];

  console.log(allTagNodes);

  if (!tagArray.length) {  // tagArray = []일 때
    targetTags = Array.from(allTagNodes).map((tagNode) => tagNode.textContent);
  }

  allTagNodes.forEach((tagNode) => {
    if (targetTags.includes(tagNode.textContent)) {
      const tagObj = { "tag": tagNode.textContent };

      tagKeyValue.push(tagObj);
      tagNode.remove();
    }
  })
  if (options.clearDB) accessTagDB("delete", tagKeyValue);
}

function appendTagToTask(targetTask, _tags) {
  const targetTaskNode = document.querySelector(`#${targetTask.id}`);
  const tagDiv = targetTaskNode.querySelector(".task-tags");
  let tagArray = [];

  for (const tag of _tags) {
    if (targetTask.tags && targetTask.tags.includes(tag)) continue;  // 추가할 태그가 해당 Task에 없을 때만 추가하도록 배열 필터링
    tagArray.push(tag);
    targetTask.addNewTag(tag);
  }
  createTagNode(tagDiv, tagArray);
}

/* IndexedDB에 저장된 데이터를 불러오는 함수 */
function loadIndexedDB() {
  const transaction = db.transaction(["task", "tagList"]);

  const taskObjectStore = transaction.objectStore("task");  // A. Task 가져오기
  const taskFetchRequest = taskObjectStore.getAll();

  const tagObjectStore = transaction.objectStore("tagList");  // B. 태그 리스트 목록 가져오기
  const tagFetchRequest = tagObjectStore.getAll();

  taskFetchRequest.onsuccess = () => {  // C-1. DB 내의 Task를 HTML Element로 나타내기 
    taskFetchRequest.result.forEach((obj) => {
      let task = new Todo(obj);
      const taskNode = task.createTaskNode();
      const taskTagNode = taskNode.querySelector(".task-tags")
      const destClass = task.isCompleted ? "completed" : "ongoing";

      moveTaskElement(taskNode, destClass);
      createTagNode(taskTagNode, task.tags, { initialLoad: true });
    })
  }

  tagFetchRequest.onsuccess = () => {  // C-2. DB 내의 tagList를 태그 목록에 나타내기 
    const tagList = document.querySelector(".tag-list");
    const options = { makeCheckbox: true, initialLoad: true };
    const tagArray = tagFetchRequest.result.map((el) => el.tag);

    createTagNode(tagList, tagArray, options);
  }
}

function loadLocalStorage() {
  const userTitle = localStorage.getItem("title");
  const darkMode = localStorage.getItem("dark-mode");

  const todoTitle = document.querySelector("header > h2");
  const darkModeToggler = document.querySelector("#default");

  if (userTitle) {  // Title 변경
    todoTitle.textContent = userTitle
  };
  if (darkMode) {  // 기존 다크모드 적용
    darkModeToggler.setAttribute("checked", true);
    darkModeSetter(true);
  };
}

const domElements = {
  "newTask": document.querySelector("#add-task input[type=text]"),
  "datePicker": document.querySelector("#add-task input[type=date]"),
  "addButton": document.querySelector("#add-task input[type=button]"),
  "taskLists": document.querySelector(".todo_list"),
  "title": document.querySelector("main>header"),
  "tagList": document.querySelector(".tag-list"),
  "newTag": document.querySelector("#createTag"),
  "addTagButton": document.querySelector(".tag-conf #addTag"),
  "deleteTagButton": document.querySelector(".tag-conf #deleteTag"),
  "sidePanel": document.querySelector("aside"),
  "sideTitle": document.querySelector("aside h2"),
  "sideDueDate": document.querySelector("aside .dueDate"),
  "sideTags": document.querySelector("aside .tag-list"),
  "toggleDark": document.querySelector("#default")
};

/* Task 목록 관련 이벤트 핸들러 */
(function () {
  // 1-1. 새 Task 추가(Enter)
  domElements.newTask.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      let task = e.currentTarget.value;
      console.log(taskTag[0]);
      let dueDate = domElements.datePicker.value;

      addNewTask(task, dueDate);
      domElements.newTask.value = ""; // 할일 입력란 지우기
      /* accessTaskDB(dbOperation, thisTask); */
    }
  });

  // 1-2. 새 Task 추가(버튼 클릭)
  domElements.addButton.addEventListener("click", (e) => {
    let task = domElements.newTask.value;
    let dueDate = domElements.datePicker.value

    addNewTask(task, dueDate);
    domElements.newTask.value = ""; // 할일 입력란 지우기
    /* accessTaskDB(dbOperation, thisTask); */
  });

  domElements.taskLists.addEventListener("click", async (e) => {
    const thisTaskNode = e.target.closest("div.task");
    let thisTask;
    let dbOperation;

    // 2. 완료 및 미완료 Task 체크 할 때: 진행중, 완료 목록으로 이동
    if (e.target.matches(".task-label input[type=checkbox]")) {
      const thisTaskObj = await findTaskFromElement(thisTaskNode);

      thisTask = new Todo(thisTaskObj);
      thisTask.toggleCompletion();
      dbOperation = "modify";

      const destNodeClass = thisTask.isCompleted ? "completed" : "ongoing";
      moveTaskElement(thisTaskNode, destNodeClass);
      accessTaskDB(dbOperation, thisTask);
    }

    // 3. 각 Task에 태그 추가
    if (e.target.matches(".task-tags")) {  // TODO: 기존 태그 삭제하기
      const thisTaskObj = await findTaskFromElement(thisTaskNode);
      dbOperation = "modify";
      thisTask = new Todo(thisTaskObj);

      const tagList = document.querySelector(".tag-list").cloneNode(true); // 각 Task에 tag-list 클론 후 삽입
      tagList.className = "cloned-tag-list"
      thisTaskNode.appendChild(tagList);

      // tag-list의 태그를 클릭하면 해당 태그를 Task에 추가
      tagList.addEventListener("click", async (e) => {
        if (e.target.matches(".tags input")) {
          const taskNodeId = e.target.closest("div.task").id;
          const taskTag = [e.target.parentElement.textContent];

          let fetchResult = await isTaskHasTag(taskTag) || [];
          let taskIncluded = fetchResult.includes(taskNodeId);

          if (!taskIncluded) {
            appendTagToTask(thisTask, taskTag);
            fetchResult.push(taskNodeId); // Tag ObjectStore에 Task Id 넣어 갱신

            const injectTagKey = [{ "tag": taskTag[0], "assignedTask": fetchResult }];
            accessTagDB("put", injectTagKey);
          }
          accessTaskDB(dbOperation, thisTask);
        }
      })
    }

    // 4. Task 삭제
    if (e.target.matches(".close")) {
      const thisTaskObj = await findTaskFromElement(thisTaskNode);

      thisTask = new Todo(thisTaskObj);
      dbOperation = "delete";
      thisTaskNode.remove();
      accessTaskDB(dbOperation, thisTask);
    }

    // 5. Task 세부 내용 사이드 화면에서 보기
    if (e.target.matches(".task-label")) {
      const id = e.target.closest(".task").id;
      configureSidePanel(id);
    }
  })

  /* 해당 Task를 사이드 패널에 표시해주는 함수 */
  // taskId = 해당 Task Node의 id
  async function configureSidePanel(taskId) {
    const thisTaskData = await findTaskDB("id", taskId);
    const tagClearOption = { clearDB: false };
    const tagOptions = { makeCheckbox: false, initialLoad: true };

    domElements.sideTitle.textContent = thisTaskData.title;
    domElements.sideDueDate.textContent = thisTaskData.dueDate;

    if (domElements.sideTags.textContent) {
      deleteTagNode(domElements.sideTags, [], tagClearOption);
    };

    createTagNode(domElements.sideTags, thisTaskData.tags, tagOptions);
  }

  // 6. 만료일 수정
  domElements.taskLists.addEventListener("change", async (e) => {
    const thisTaskNode = e.target.closest("div.task");
    const thisDateLabel = thisTaskNode?.querySelector("label.dueDate");
    const nextDue = e.target.value;
    let thisTask;

    if (nextDue && e.target.matches(".extra input")) {
      const thisTaskObj = await findTaskFromElement(thisTaskNode);

      thisTask = new Todo(thisTaskObj);
      dbOperation = "modify";

      thisDateLabel.textContent = nextDue; // 각 Task 목록에 만료일 표시 
      thisTask.dueDate = nextDue;

      accessTaskDB(dbOperation, thisTask);
    }
  })
})();


/* 태그 관련 이벤트 핸들러 */
(function () {
  // 1-1. 태그 목록에 새 태그 추가(Enter)
  domElements.newTag.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      if (domElements.newTag.value.length <= 1) {
        alert("태그는 두 글자 이상을 입력해주세요.")
        domElements.newTag.value = "";
        return;
      }

      const newTags = domElements.newTag.value.match(/[^#\s]\S{0,}[^\s,]/g);
      const createOption = { makeCheckbox: true };
      const tagArray = createTagKeyArr(newTags);

      createTagNode(domElements.tagList, tagArray, createOption);
      accessTagDB("add", tagArray);
      domElements.newTag.value = "";
    }
  })

  // 1-2. 태그 목록에 새 태그 추가(버튼 클릭)
  domElements.addTagButton.addEventListener("click", (e) => {
    if (domElements.newTag.value.length <= 1) {
      alert("태그는 두 글자 이상을 입력해주세요.")
      domElements.newTag.value = "";
      return;
    }

    const newTags = domElements.newTag.value.match(/[^#\s]\S{0,}[^\s,]/g);
    const createOption = { makeCheckbox: true };
    const tagArray = createTagKeyArr(newTags);

    createTagNode(domElements.tagList, tagArray, createOption);
    accessTagDB("add", tagArray);
    domElements.newTag.value = "";
  })

  // 2. 태그 목록에서 태그 삭제 
  domElements.deleteTagButton.addEventListener("click", (e) => {
    domElements.tagList.classList.add("deleteAnimation");
  });

  /* FIXME: 체크된 상태에서 새로고침 할 경우 체크되었는지 표시가 안 나고, 필터링도 안 되어 있음 */
  /* 3. 태그별 Task 필터링 */
  domElements.tagList.addEventListener("change", async (e) => {
    const allTasks = document.querySelectorAll(".task");
    const allTags = Array.from(domElements.tagList.querySelectorAll("label"));
    const selectedTags = Array
      .from(domElements.tagList.querySelectorAll("input[type=checkbox]:checked"))
      .map(el => el.parentElement.innerText);

    // A. 체크된 태그 진한 배경색으로 변경 (class: "selected")
    allTags.forEach((el) => {
      if (selectedTags.includes(el.textContent)) {
        el.classList.add("selected");
      }
      else {
        el.classList.remove("selected");
      }
    });

    const filteredId = await isTaskHasTag(selectedTags);

    // B. Task 필터링 (class: "filtered")
    allTasks.forEach((task) => {
      if (!filteredId.includes(task.id) && selectedTags.length) {
        task.classList.add("filtered");
      }
      else {
        task.classList.remove("filtered");
      }
    })
  })
})();

// 7. Task 목록 제목 수정
domElements.title.addEventListener("click", (e) => {
  if (e.target.matches(":is(div, h2")) {
    const newTitle = prompt("Task 목록의 제목을 수정하세요.");
    e.currentTarget.querySelector("h2").innerText = newTitle || "할 일 목록";
    localStorage.setItem("title", newTitle);
  }
})

/* 문서 변경될 때마다 localStorage에 저장 */
/* (function () {
  const observeTarget = document.querySelector("main");
  let mainObserver = new MutationObserver(exportToLocalStorage);
  const config = { attributes: true, childList: true, characterData: true, subtree: true };

  mainObserver.observe(observeTarget, config);
})(); */

/* FIXME:  */
document.addEventListener("click", (e) => { // cloned tag list 창 지우기
  const clonedTagList = document.querySelectorAll(".cloned-tag-list");

  if (clonedTagList && e.target.classList.value.indexOf("tags") < 0) {
    clonedTagList.forEach((node) => {
      node.parentNode.removeChild(node);
    })
  }
})

loadLocalStorage();

domElements.toggleDark.addEventListener("change", (e) => { darkModeSetter(e.target.checked)})

/* 다크모드 토글 함수 */
function darkModeSetter(checked = false) {
  document.documentElement.setAttribute("dark-theme", checked);
  localStorage.setItem("dark-mode", checked);
}
