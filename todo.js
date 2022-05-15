import { configureTaskNode, configureTagNode, moveTaskNode } from "./modules/configureNodes.js"
import { db } from "./modules/indexedDB/initialLoad.js"
import { accessTaskDB, accessTagDB } from "./modules/indexedDB/access.js"
import { throttle } from "./modules/throttle.js"

class Todo {
    constructor(object) {
      this.id = object.id || `id_${Date.now()}`;
      this.title = object.title;
      this.isCompleted = object.isCompleted || false;
      this.dueDate = object.dueDate || '';
      this.text = object.text || '';
      this.tags = object.tags || [];
    }

    toggleCompletion() {
      this.isCompleted = !this.isCompleted;
    }

    addNewTag(tag) {
      this.tags.push(tag);
    }
  }

/* indexedDB에서 primary key 또는 index를 통해 원하는 Task를 찾는 함수 */
function findTaskDB(key, value) { // TODO: parameter로 object를 받아 검색할 수 았도록 수정
  const transaction = db.transaction('task');
  const taskObjectStore = transaction.objectStore('task');
  let searchRequest;

  if (key === 'id') {
    searchRequest = taskObjectStore.get(value);
  } else {
    searchRequest = taskObjectStore.index(key).getAll(value);
  }

  return new Promise((resolve) => {
    searchRequest.onsuccess = (e) => {
      resolve(e.target.result);
    };
  });
}

/* 태그 배열을 받아 해당 태그가 indexedDB에 존재하는지 검색하고, 그 결과를 반환하는 함수 */
// keyArray = [{"tag": "태그1", "assignedTask": ["id_1", "id_2"]}, ...] 또는 ["태그1", "태그2", ...]
function isTagExistInDB(keyArray) {
  const transaction = db.transaction('tagList');
  const tagObjectStore = transaction.objectStore('tagList');
  const searchRequests = [];
  const resultPromises = [];

  keyArray.forEach((key, index) => {
    const tag = key.tag ? key.tag : key;

    searchRequests[index] = tagObjectStore.get(tag);
    resultPromises[index] = new Promise((resolve) => {
      searchRequests[index].onsuccess = (e) => { // 검색 결과가 없을 경우 결과값 undefined로 onsuccess 실행
        const searchResult = e.target.result || null;
        resolve(searchResult);
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

  return fetchResult.reduce((accu, next, index) => {
    if (index === 0) { return next.assignedTask; }
    if (!next.length) return [];
    return next.assignedTask.filter((taskId) => accu.includes(taskId));
  }, []);
}

/* 함수 accessTagDB()의 argument인 key-value 객체 배열을 만드는 함수 */
function createTagKeyArr(tagArray) {
  return tagArray.map((tag) => ({ tag: `#${tag}`, assignedTask: [] }));
}

/* 새 Task 생성 함수 */
function addNewTask(taskTitle, _dueDate) {
  if (!taskTitle) {
    alert('할 일을 입력해주세요.');
    return;
  }

  const newTask = new Todo({ "title": taskTitle, "dueDate": _dueDate });
  const element = configureTaskNode(newTask);

  moveTaskNode(element, 'ongoing');
  accessTaskDB('add', newTask); // DB에 할일 추가
}

/* 해당 위치의 Tag Node를 삭제하는 함수(DB에서도 삭제) */
// tagArray = ["태그1", "태그2", ...], 모든 태그를 삭제할 경우 []로 지정
async function deleteTagNode(targetNode, tagArray = [], userOptions = {}) {
  const allTagNodes = targetNode.querySelectorAll('.tags');
  const { clearDB } = { clearDB: false, ...userOptions };
  const tagKeyValue = [];
  let targetTags = tagArray;


  if (!tagArray.length) { // tagArray = []일 때
    targetTags = Array.from(allTagNodes).map((tagNode) => tagNode.textContent);
  }

  allTagNodes.forEach((tagNode) => {
    if (targetTags.includes(tagNode.textContent)) {
      const tagObj = { tag: tagNode.textContent };

      tagKeyValue.push(tagObj);
      tagNode.remove();
    }
  });
  if (!clearDB) accessTagDB('delete', tagKeyValue);
}

function appendTagToTask(targetTask, _tags) {
  const targetTaskNode = document.querySelector(`#${targetTask.id}`);
  const tagDiv = targetTaskNode.querySelector('.task-tags');
  const tagArray = [];

  for (const tag of _tags) {
    if (targetTask.tags?.includes(tag)) continue; // 추가할 태그가 해당 Task에 없을 때만 추가하도록 배열 필터링
    tagArray.push(tag);
    targetTask.addNewTag(tag);
  }
  configureTagNode(tagDiv, tagArray);
}

/* localStorage에 저장된 데이터(할일 제목, 다크모드 여부)를 불러오는 함수 */
function loadLocalStorage() {
  const todoTitle = document.querySelector('header > h2');
  const userTitle = localStorage.getItem('title');

  const darkModeToggler = document.querySelector('#default');
  const userDarkMode = localStorage.getItem('dark-mode');


  if (userTitle) { // Title 변경
    todoTitle.textContent = userTitle;
  }
  if (userDarkMode === 'true') { // 유저 다크모드 적용
    darkModeToggler.setAttribute('checked', true);
    darkModeSetter(true);
  }
}

/* 해당 Task를 사이드 패널에 표시해주는 함수 */
// taskId = 해당 Task Node의 id
async function configureSidePanel(taskId) {  // TODO: 코드 정리, 간략화
  const sidePanel = document.querySelector('aside');
  const sideTitle = document.querySelector('aside h2');
  const sideDueDate = document.querySelector('aside .dueDate');
  const sideTags = document.querySelector('aside .tag-list');

  const thisTaskData = await findTaskDB('id', taskId);

  sidePanel.setAttribute("id", `side/${taskId}`);
  sideTitle.textContent = thisTaskData.title;
  sideDueDate.textContent = thisTaskData.dueDate;
  if (sideTags.textContent) {
    deleteTagNode(sideTags);
  }

  configureTagNode(sideTags, thisTaskData.tags, { fetchDB: false });
}

/* Task 추가 이벤트 핸들러 */
(function () {
  const newTask = document.querySelector('#add-task input[type=text]');
  const datePicker = document.querySelector('#add-task input[type=date]');
  const addButton = document.querySelector('#add-task input[type=button]');

  // 1-1. 새 Task 추가(Enter)
  newTask.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
      addNewTask(newTask.value, datePicker.value);
      newTask.value = ''; // 할일 입력란 지우기
    }
  });

  // 1-2. 새 Task 추가(버튼 클릭)
  addButton.addEventListener('click', () => {
    addNewTask(newTask.value, datePicker.value);
    newTask.value = ''; // 할일 입력란 지우기
  });
})();

async function taskEvent(e) {
  const thisTaskNode = e.target.closest('div.task');
  const taskId = thisTaskNode.id;

  // 2. 완료 및 미완료 Task 체크 할 때: 진행중, 완료 목록으로 이동
  if (e.target.matches('.task-label [type=checkbox]')) {
    const thisTaskObj = await findTaskDB('id', taskId);

    thisTaskObj.isCompleted = !thisTaskObj.isCompleted;

    const destNodeClass = thisTaskObj.isCompleted ? 'completed' : 'ongoing';
    moveTaskNode(thisTaskNode, destNodeClass);
    accessTaskDB('modify', thisTaskObj);
  }

  // 3. 각 Task에 태그 추가
  if (e.target.matches('.task-tags')) { // TODO: 태그 추가 대신 아이콘으로 대체
    const thisTaskObj = await findTaskDB('id', taskId);

    const tagList = document.querySelector('.tag-list').cloneNode(true); // 각 Task에 tag-list 클론 후 삽입
    tagList.className = 'cloned-tag-list';
    thisTaskNode.appendChild(tagList);

    // tag-list의 태그를 클릭하면 해당 태그를 Task에 추가
    tagList.addEventListener('click', async (e) => {
      if (e.target.matches('.tags input')) {
        const taskNodeId = e.target.closest('div.task').id;
        const taskTag = [e.target.parentElement.textContent];

        const fetchResult = await isTaskHasTag(taskTag) || [];
        const taskIncluded = fetchResult.includes(taskNodeId);

        if (!taskIncluded) {
          appendTagToTask(thisTaskObj, taskTag);
          fetchResult.push(taskNodeId); // Tag ObjectStore에 Task Id 넣어 갱신

          const injectTagKey = [{ tag: taskTag[0], assignedTask: fetchResult }];
          accessTagDB('modify', injectTagKey);
        }
        accessTaskDB('modify', thisTaskObj);
      }
    });
  }

  // 4. Task 삭제
  if (e.target.matches('.close')) {
    const thisTaskObj = await findTaskDB('id', taskId);

    thisTaskNode.remove();
    accessTaskDB('delete', thisTaskObj);
  }

  // 5. Task 세부 내용 사이드 화면에서 보기
  if (e.target.matches('.task-label')) {
    const { id } = e.target.closest('.task');
    configureSidePanel(id);
  }
}


/* Task 목록 관련 이벤트 핸들러 */
(function () {
  const taskLists = document.querySelector('.todo_list');

  taskLists.addEventListener('click', async (e) => { taskEvent(e) });

  // 6. 만료일 수정
  taskLists.addEventListener('change', async (e) => {
    const thisTaskNode = e.target.closest('div.task');
    const taskId = thisTaskNode.id;
    const thisDateLabel = thisTaskNode?.querySelector('label.dueDate');
    const nextDue = e.target.value;

    if (nextDue && e.target.matches('.extra input')) {
      const thisTaskObj = await findTaskDB('id', taskId);

      thisDateLabel.textContent = nextDue; // 각 Task 목록에 만료일 표시
      thisTaskObj.dueDate = nextDue;
      accessTaskDB('modify', thisTaskObj);
    }
  });
})();
function sideTextSave () {
  console.log("텍스트 입력");


}
/* 사이드 패널 관련 이벤트 핸들러 */
(function () {
  const sideText = document.querySelector("aside .text");

  // 1. sideText 화면 클릭 시 텍스트 입력창 표시
  sideText.addEventListener("click", (e) => {
    if (e.currentTarget.childNodes.length < 1) {
      const textInput = document.createElement("textarea");
      textInput.setAttribute("placeholder", "텍스트를 입력하세요.");
      /* textInput.setAttribute("id", ) */
      sideText.appendChild(textInput);
      textInput.focus();  // 텍스트 입력창 포커스
    }
  })

  // 2. sideText 입력 내용 저장
  sideText.addEventListener("keyup", (e) => {
    throttle(sideTextSave, 400);
  })

})();

/* 태그 관련 이벤트 핸들러 */
(function () {
  const tagList = document.querySelector('.tag-list');
  const newTag = document.querySelector('#createTag');
  const addTagButton = document.querySelector('.tag-conf #addTag');
  const deleteTagButton = document.querySelector('.tag-conf #deleteTag');

  // 1-1. 태그 목록에 새 태그 추가(Enter)
  newTag.addEventListener('keyup', (e) => {
    if (e.keyCode !== 13) return;
    if (newTag.value.length <= 1) {
      alert('태그는 두 글자 이상을 입력해주세요.');
      newTag.value = '';
      return;
    }

    const newTags = newTag.value.match(/[^#\s]\S{0,}[^\s,]/g);
    const tagArray = createTagKeyArr(newTags);

    configureTagNode(tagList, tagArray, { makeCheckbox: true });
    accessTagDB('add', tagArray);
    newTag.value = '';
  });

  // 1-2. 태그 목록에 새 태그 추가(버튼 클릭)
  addTagButton.addEventListener('click', () => {
    if (newTag.value.length <= 1) {
      alert('태그는 두 글자 이상을 입력해주세요.');
      newTag.value = '';
      return;
    }

    const newTags = newTag.value.match(/[^#\s]\S{0,}[^\s,]/g);
    const tagArray = createTagKeyArr(newTags);

    configureTagNode(tagList, tagArray, { makeCheckbox: true });
    accessTagDB('add', tagArray);
    newTag.value = '';
  });

  // 2. 태그 목록에서 태그 삭제
  deleteTagButton.addEventListener('click', () => {
    tagList.classList.add('deleteAnimation');
  });

  /* FIXME: 체크된 상태에서 새로고침 할 경우 체크되었는지 표시가 안 나고, 필터링도 안 되어 있음 */
  /* 3. 태그별 Task 필터링 */
  tagList.addEventListener('change', async () => {
    const allTasks = document.querySelectorAll('.task');
    const allTags = Array.from(tagList.querySelectorAll('label'));
    const selectedTags = Array
      .from(tagList.querySelectorAll('input[type=checkbox]:checked'))
      .map((el) => el.parentElement.innerText);

    // A. 체크된 태그 진한 배경색으로 변경 (class: "selected")
    allTags.forEach((el) => {
      if (selectedTags.includes(el.textContent)) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

    const filteredId = await isTaskHasTag(selectedTags);

    // B. Task 필터링 (class: "filtered")
    allTasks.forEach((task) => {
      if (!filteredId.includes(task.id) && selectedTags.length) {
        task.classList.add('filtered');
      } else {
        task.classList.remove('filtered');
      }
    });
  });
}());

const title = document.querySelector('main>header');
// 7. Task 목록 제목 수정
title.addEventListener('click', (e) => {
  if (e.target.matches(':is(div, h2')) {
    const newTitle = prompt('Task 목록의 제목을 수정하세요.');
    e.currentTarget.querySelector('h2').innerText = newTitle || '할 일 목록';
    localStorage.setItem('title', newTitle);
  }
});


/* FIXME:  */
document.addEventListener('click', (e) => { // cloned tag list 창 지우기
  const clonedTagList = document.querySelectorAll('.cloned-tag-list');

  if (clonedTagList && e.target.classList.value.indexOf('tags') < 0) {
    clonedTagList.forEach((node) => {
      node.parentNode.removeChild(node);
    });
  }
});


loadLocalStorage();

/* 다크모드 토글 함수 */
function darkModeSetter(checked = false) {
  document.documentElement.setAttribute('dark-theme', checked);
  localStorage.setItem('dark-mode', checked);
}

(function () {
  const toggleDark = document.querySelector('#default');
  toggleDark.addEventListener('change', (e) => { darkModeSetter(e.target.checked); });
})();
