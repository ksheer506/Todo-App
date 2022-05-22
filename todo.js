import { configureTaskNode, configureTagNode, moveTaskNode } from "./modules/configureNodes.js";
import { db } from "./modules/db/initialLoad.js";
import { accessTaskDB, accessTagDB } from "./modules/db/access.js";
import { throttle } from "./modules/throttle.js";
import * as dom from "./modules/dom.js";

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

  keyArray.forEach((key, i) => {
    const tag = key?.tag || key;

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

  const fetchResult = await isTagExistInDB(tagArray);  // return: [{"tag": "태그1", "assignedTask": ["id_1", "id_2"]}, ...]

  // 검색된 태그를 모두 가지는 Task를 필터링(교집합)
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
  const userTitle = localStorage.getItem('title');
  const userDarkMode = localStorage.getItem('dark-mode');

  if (userTitle) { // Title 변경
    dom.mainTitle.textContent = userTitle;
  }
  if (userDarkMode === 'true') { // 유저 다크모드 적용
    dom.darkToggler.setAttribute('checked', true);
    darkModeSetter(true);
  }
}

/* 해당 Task를 사이드 패널에 표시해주는 함수 */
// taskId = 해당 Task Node의 id
async function configureSidePanel(taskId) {  // TODO: 코드 정리, 간략화
  const thisTask = await findTaskDB('id', taskId);

  dom.sdPanel.setAttribute("id", `side/${taskId}`);
  dom.sdTitle.textContent = thisTask.title;
  dom.sdDueDate.textContent = thisTask.dueDate;
  dom.sdText.textContent = thisTask.text;

  if (dom.sdTags.textContent) {
    deleteTagNode(dom.sdTags);
  }
  configureTagNode(dom.sdTags, thisTask.tags, { fetchDB: false });
}

/* Task 추가 이벤트 핸들러 */
(function () {
  // 1-1. 새 Task 추가(Enter)
  dom.newTask.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
      addNewTask(dom.newTask.value, dom.datePicker.value);
      dom.newTask.value = ''; // 할일 입력란 지우기
    }
  });

  // 1-2. 새 Task 추가(버튼 클릭)
  dom.addBtn.addEventListener('click', () => {
    addNewTask(dom.newTask.value, dom.datePicker.value);
    dom.newTask.value = ''; // 할일 입력란 지우기
  });
})();

async function taskEvent(e) {
  const thisTaskNode = e.target.closest('div.task');
  const taskId = thisTaskNode?.id;

  if (!thisTaskNode) return;

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
    if (document.documentElement.clientWidth <= 600) {
      sidePanelToggle();
    }

    const { id } = e.target.closest('.task');
    configureSidePanel(id);
  }
}


/* Task 목록 관련 이벤트 핸들러 */
(function () {

  dom.taskList.addEventListener('click', async (e) => { taskEvent(e) });

  // 6. 만료일 수정
  dom.taskList.addEventListener('change', async (e) => {
    const thisTaskNode = e.target.closest('div.task');
    const taskId = thisTaskNode?.id;
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

async function sideTextSave(e) {
  const [taskId] = dom.sdPanel.id.match(/(?<=\/)id(.*)/);
  const task = await findTaskDB("id", taskId);

  accessTaskDB("modify", { ...task, ...{ "text": e.target.value } })
}

function sidePanelToggle() {
  if (dom.sdPanel.classList.contains("sideshow")) {
    dom.main.classList.remove("sideshow");
    dom.sdPanel.classList.remove("sideshow");
    dom.sdBG.classList.remove("sideshow");
    return;
  }
  dom.main.classList.add("sideshow");
  dom.sdPanel.classList.add("sideshow");
  dom.sdBG.classList.add("sideshow");
};

/* 사이드 패널 관련 이벤트 핸들러 */
(function () {
  let editState = false;
  // 1. sideText 화면 클릭 시 텍스트 입력창 표시
  dom.sdText.addEventListener("click", (e) => {
    const {nodeType, textContent} = dom.sdText.childNodes[0] || {};

    if (!nodeType) {  // 아무 element도 없을 때
      const textInput = document.createElement("textarea");

      textInput.setAttribute("placeholder", "텍스트를 입력하세요.");
      dom.sdText.appendChild(textInput);
      textInput.focus();  // 텍스트 입력창 포커스
      editState = true;
      return;
    }

    if (nodeType === 3) {
      const textInput = document.createElement("textarea");

      textInput.setAttribute("placeholder", "텍스트를 입력하세요.");
      textInput.textContent = textContent;
      dom.sdText.replaceChild(textInput, dom.sdText.childNodes[0]);
      textInput.focus();  // 텍스트 입력창 포커스
      editState = true;
    }
  })

  // 2-1. sideText 입력 내용 저장: focus-out할 때
  dom.sdText.addEventListener("focusout", (e) => {
    if (editState) sideTextSave(e);
    sidePanelToggle();
    e.target.remove();
    editState = false;
  })

  // 2-2. sideText 입력 내용 저장: background 클릭할 때
  dom.sdBG.addEventListener("click", (e) => {
    if (editState) sideTextSave(e);
    sidePanelToggle();
    editState = false;
  });

})();



/* 태그 관련 이벤트 핸들러 */
(function () {
  // 1-1. 태그 목록에 새 태그 추가(Enter)
  dom.newTag.addEventListener('keyup', (e) => {
    if (e.keyCode !== 13) return;
    if (dom.newTag.value.length <= 1) {
      alert('태그는 두 글자 이상을 입력해주세요.');
      dom.newTag.value = '';
      return;
    }

    const newTags = dom.newTag.value.match(/[^#\s]\S{0,}[^\s,]/g);
    const tagArray = createTagKeyArr(newTags);

    configureTagNode(dom.tagList, tagArray, { makeCheckbox: true });
    accessTagDB('add', tagArray);
    dom.newTag.value = '';
  });

  // 1-2. 태그 목록에 새 태그 추가(버튼 클릭)
  dom.addTagBtn.addEventListener('click', () => {
    if (dom.newTag.value.length <= 1) {
      alert('태그는 두 글자 이상을 입력해주세요.');
      dom.newTag.value = '';
      return;
    }

    const newTags = dom.newTag.value.match(/[^#\s]\S{0,}[^\s,]/g);
    const tagArray = createTagKeyArr(newTags);

    configureTagNode(dom.tagList, tagArray, { makeCheckbox: true });
    accessTagDB('add', tagArray);
    dom.newTag.value = '';
  });

  // 2. 태그 목록에서 태그 삭제
  dom.deleteTagBtn.addEventListener('click', () => {
    dom.tagList.classList.add('deleteAnimation');
  });

  /* FIXME: 체크된 상태에서 새로고침 할 경우 체크되었는지 표시가 안 나고, 필터링도 안 되어 있음 */
  /* 3. 태그별 Task 필터링 */
  dom.tagList.addEventListener('change', async () => {
    const allTags = dom.tagList.querySelectorAll('label');
    const selectedTags = Array
      .from(dom.tagList.querySelectorAll('input[type=checkbox]:checked'))
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
    Array.from(dom.allTasks).forEach((task) => {
      if (!filteredId.includes(task.id) && selectedTags.length) {
        task.classList.add('filtered');
      } else {
        task.classList.remove('filtered');
      }
    });
  });
}());

function titleEditor() {
  const newTitle = prompt('Task 목록의 제목을 수정하세요.');
  dom.mainTitle.textContent = newTitle || '할 일 목록';
  localStorage.setItem('title', newTitle);
};

// 7. 메인 제목 수정
dom.mainTitle.addEventListener('click', titleEditor);
dom.editTitle.addEventListener('click', titleEditor);


/* FIXME: 삭제 예정 */
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


dom.darkToggler.addEventListener('change', (e) => { darkModeSetter(e.target.checked); });
