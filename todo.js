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



loadLocalStorage();

/* 다크모드 토글 함수 */
function darkModeSetter(checked = false) {
  document.documentElement.setAttribute('dark-theme', checked);
  localStorage.setItem('dark-mode', checked);
}


dom.darkToggler.addEventListener('change', (e) => { darkModeSetter(e.target.checked); });
