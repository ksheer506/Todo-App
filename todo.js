import { configureTaskNode, configureTagNode, moveTaskNode } from "./modules/configureNodes.js";
import { db } from "./modules/db/initialLoad.js";
import { accessTaskDB, accessTagDB } from "./modules/db/access.js";
import { throttle } from "./modules/throttle.js";
import * as dom from "./modules/dom.js";

/* indexedDB에서 primary key 또는 index를 통해 원하는 Task를 찾는 함수 */
function findTaskDB(key, value) { // TODO: parameter로 object를 받아 검색할 수 았도록 수정
  const taskObjectStore = db.transaction('task').objectStore('task');
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


/* 함수 accessTagDB()의 argument인 key-value 객체 배열을 만드는 함수 */
function createTagKeyArr(tagArray) {
  return tagArray.map((tag) => ({ tag: `#${tag}`, assignedTask: [] }));
}


/* 해당 위치의 Tag Node를 삭제하는 함수(DB에서도 삭제) */
// tagArray = ["태그1", "태그2", ...], 모든 태그를 삭제할 경우 할당 x
async function deleteTagNode(targetNode, tagArray = "all", userOptions = {}) {
  const allTagNodes = targetNode.querySelectorAll('.tags');
  const { clearDB } = { clearDB: false, ...userOptions };
  const tagKeyValue = [];
  let targetTags = tagArray;

  if (tagArray === "all") {
    targetTags = Array.from(allTagNodes).map((tagNode) => tagNode.textContent);
  }

  allTagNodes.forEach((tagNode) => {
    if (targetTags.includes(tagNode.textContent)) {
      tagKeyValue.push( { "tag": tagNode.textContent } );
      tagNode.remove();
    }
  });
  if (clearDB) accessTagDB('delete', tagKeyValue);
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
  const userTitle = localStorage.getItem('title') || '할 일 목록';
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


async function taskEvent(e) {
  const thisTaskNode = e.target.closest('li.task');
  const taskId = thisTaskNode?.id;

  if (!thisTaskNode) return;


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

}




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
