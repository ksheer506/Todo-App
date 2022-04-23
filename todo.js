/* 할일 목록 배열에 저장(localStorage 이용) */
let taskArray = [];

/* 할일 배열(taskArray)에서 taskNode값으로 해당 객체를 찾는 함수 */
function findTaskObject(eventTarget) {  // func(이벤트가 발생한 target)
  const targetNode = eventTarget.target.closest(".task");
  return taskArray.find((el) => { return el.taskNode === targetNode });
}

function deleteTaskObject(taskObject) {
  taskArray = taskArray.filter((el) => { return el.taskNode !== taskObject.taskNode; });
}

class Todo {
  constructor(_title, _isCompleted = 0, ...extras) {
    this.title = _title;
    this.isCompleted = _isCompleted;
    this.dueDate = extras[0];
    this.text = extras[1];
    this.tags = extras[2] || [];
  }

  createTaskNode() {
    // 체크박스 만들기
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // 체크박스 라벨 만들기
    const taskDiv = document.createElement("div");
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(document.createTextNode(this.title));
    taskDiv.appendChild(document.createElement("br"));
    taskDiv.classList.add("task-label");

    // 제거 버튼 만들기
    const close = document.createElement("div");
    close.appendChild(document.createTextNode("x"));
    close.className = "close";

    // 태그 만들기
    const tagDiv = document.createElement("div");
    tagDiv.className = "task-tags";

    // 오른쪽 추가 정보(만료일, 닫기 버튼) 만들기
    const extraDiv = document.createElement("div");

    // 만료일자가 있을 때 만료일 만들기
    const dateChanger = document.createElement("input");  // 만료일 수정 input element
    dateChanger.type = "date";
    extraDiv.appendChild(dateChanger);

    const date = document.createElement("p");  // 만료일 표시 element
    date.className = "dueDate";
    if (this.dueDate) {
      date.appendChild(document.createTextNode(this.dueDate));
      dateChanger.value = `${this.dueDate}`;
    }
    extraDiv.appendChild(date);
    extraDiv.appendChild(close);
    extraDiv.className = "extra";

    // 모든 요소 묶기
    const div = document.createElement("div");
    div.appendChild(taskDiv);
    div.appendChild(tagDiv);
    div.appendChild(extraDiv);
    div.className = "task";

    this.taskNode = div; // 생성한 노드를 반환
    taskArray.push(this);
  }

  moveTask(destNodeClass = "ongoing") { // func(목적지 노드 class명)
    let taskNode = this.taskNode;
    const destNode = document.querySelector(`section.${destNodeClass}`)

    destNode.appendChild(taskNode);

    if (destNodeClass === "ongoing") { // 미완료된 할일일 경우
      taskNode.querySelector("input").removeAttribute("checked");
      this.isCompleted = 0;
    }
    else if (destNodeClass === "completed") { // 완료된 할일일 경우
      taskNode.querySelector("input").setAttribute("checked", "1");
      this.isCompleted = 1;
    }
  };

  deleteTask() {
    deleteTaskObject(this);
    this.taskNode.remove();
  };

  /* FIXME: localStorage 불러올 때, 새 태그 추가할 때 동작이 다른데 동일한 매세드 사용? */
  insertTaskTags(_tags) {
    const tagDiv = this.taskNode.querySelector(".task-tags");

    _tags.forEach((tag) => {
      const eachTag = document.createElement("label");
      eachTag.appendChild(document.createTextNode(tag));
      eachTag.className = "tags"

      tagDiv.appendChild(eachTag);

      if (!this.tags || !this.tags.includes(tag)) this.tags.push(tag); // 추가할 태그가 해당 할일에 없을 때만 추가
    })
  }
}

/* localStorage에 저장된 내용 불러오는 함수 */
function loadLocalStorage() {
  if (localStorage && localStorage.getItem("tasks")) {
    arr = JSON.parse(localStorage.getItem("tasks"));
    arr.forEach((obj) => {
      //FIXME: property 추가할 때 일일히 수정해야 하는 문제 있음
      const { title, isCompleted, dueDate, text, tags } = obj;
      let parameter = [title, isCompleted, dueDate, text, tags]
      let task = new Todo(...parameter);

      task.createTaskNode();
      if (task.tags) task.insertTaskTags(task.tags);

      const destClass = task.isCompleted ? "completed" : "ongoing";
      task.moveTask(destClass);
    });
  }
}

/* TODO: 통째로 저장하지 말고, 변경 사항 있는 부분만 수정하도록 */
/* 할일을 localStorage에 저장하는 함수 */
function exportToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(taskArray));
};

function addNewTask(todoTitle, dueDate) {
  if (!todoTitle) {
    alert("할 일을 입력해주세요.");
    return;
  }

  let newTodo = new Todo(todoTitle, 0, dueDate)

  newTodo.createTaskNode();
  newTodo.moveTask();
}

/* 할일 목록 이벤트 핸들러 함수 */
(function confTodo() {
  const newTask = document.querySelector("input[type=text]");
  const datePicker = document.querySelector("input[type=date]");
  const addButton = document.querySelector("input[type=button]");
  const taskLists = document.querySelector(".todo_list")
  const title = document.querySelector("main>header")

  // 새 할 일 추가(Enter)
  newTask.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      let task = e.currentTarget.value;
      let dueDate = datePicker.value;

      addNewTask(task, dueDate);
      newTask.value = ""; // 할일 입력란 지우기
    }
  });

  // 새 할 일 추가(버튼 클릭)
  addButton.addEventListener("click", () => {
    let task = newTask.value;
    let dueDate = datePicker.value

    addNewTask(task, dueDate);
    newTask.value = ""; // 할일 입력란 지우기
  });

  taskLists.addEventListener("click", (e) => {
    let thisTask;
    // 완료 및 미완료 할일: 진행중, 완료 목록으로 이동
    if (e.target.matches(".task-label input[type=checkbox]")) {
      thisTask = findTaskObject(e);

      const destNodeClass = thisTask.isCompleted ? "ongoing" : "completed";
      thisTask.moveTask(destNodeClass)
    }

    // 태그 추가
    if (e.target.matches("[class*='tags']")) {  // TODO: 기존 태그 삭제하기
      thisTask = findTaskObject(e);   // A. 각 할일에 tag-list 클론 후 삽입

      const tagList = document.querySelector(".tag-list").cloneNode(true);
      tagList.className = "cloned-tag-list"
      thisTask.taskNode.appendChild(tagList);

      // B. tag-list의 tag를 클릭하면 해당 tag를 할일에 저장
      tagList.addEventListener("click", (e) => {
        if (e.target.classList.contains("tags")) {
          console.log(e.target.textContent);
          thisTask.insertTaskTags([e.target.textContent]);
        }
      })
    }

    // 할일 삭제
    if (e.target.matches(".close")) {
      thisTask = findTaskObject(e);
      thisTask.deleteTask();
    }
  })

  // 만료일 수정
  taskLists.addEventListener("change", (e) => {
    const nextDue = e.target.value;
    if (nextDue && e.target.matches(".extra>input")) {
      e.target.nextElementSibling.innerText = nextDue;
      const thisTask = findTaskObject(e);
      thisTask.dueDate = nextDue;
    }
  })

  // 할일 목록 제목 수정
  title.addEventListener("click", (e) => {
    if (e.target.matches(":is(img, h2")) {
      const newTitle = prompt("할일 목록의 제목을 수정하세요.");
      e.currentTarget.querySelector("h2").innerText = newTitle || "할 일 목록";
    }
  })

})();

/* 태그 관련 이벤트 핸들러 */
(function () {
  const tagList = document.querySelector(".tag-list");
  const createNewTag = document.querySelector("#createTag");

  /* 1. 태그 목록에 태그 추가 */
  createNewTag.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {  // Enter로 태그 생성
      const newTags = e.currentTarget.value.match(/[^#\s]\S{0,}[^\s,]/g);

      newTags.forEach((_tag) => {
        const tag = document.createElement("label");
        const tagCheckbox = document.createElement("input");

        tag.className = "tags"
        tagCheckbox.type = "checkbox";
        tag.appendChild(tagCheckbox)
        tag.appendChild(document.createTextNode(`#${_tag}`));
        tagList.appendChild(tag);
      })
    }
  })

  /* 2. 태그별 할일 필터링 */
  tagList.addEventListener("change", (e) => {
    const allTags = Array.from(tagList.querySelectorAll("label"));
    const selectedTags = Array.from(tagList.querySelectorAll("input[type=checkbox]:checked")).map(el => el.parentElement.innerText);

    // A. 체크된 태그에 class 추가(진한 배경색으로 변경)
    allTags.forEach((el) => {
      if (selectedTags.includes(el.textContent)) {
        el.classList.add("selected");
      }
      else {
        el.classList.remove("selected");
      }
    });

    // B. 할일 필터링
    taskArray
      .map((el) => {  // 각각의 할일 객체의 태그 배열이 선택된 태그 배열(selectedTags)을 완전히 포함하는지 확인
        if (el.tags && selectedTags.length > 0) {
          return selectedTags.every(nthTag => el.tags.includes(nthTag));
        }
        else if (selectedTags.length === 0) { // 태그 선택을 모두 해제한 경우
          return true;
        }
      })
      .forEach((result, index) => {  // 태그 조건을 불만족하는 경우 "filtered" class 추가
        if (!result) {
          taskArray[index].taskNode.classList.add("filtered")
        }
        else {
          taskArray[index].taskNode.classList.remove("filtered")
        }
      })
  })
})();

/* FIXME:  */
document.body.addEventListener("click", (e) => { // cloned tag list 창 지우기
  const clonedTagList = document.querySelectorAll(".cloned-tag-list");

  if (clonedTagList && e.target.classList.value.indexOf("tags") < 0) {
    clonedTagList.forEach((node) => {
      node.parentNode.removeChild(node);
    })
  }
})

/* TODO: MutationObserver 이용해 DOM에 변화가 있을 때마다 localStorage에 저장 */
/* FIXME: 태그 추가, 할일 삭제 시 변경 사항 저장 안 됨 */
/* 문서 변경될 때마다 localStorage에 저장 */
document.addEventListener("change", (e) => {
  console.log("문서 변경됨");
  exportToLocalStorage();
})

loadLocalStorage();  // localStorage 내용 있으면 불러오기
