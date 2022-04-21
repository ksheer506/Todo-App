/* 할일 목록 배열에 저장(localStorage 이용) */
let taskArray = [];

/* 할일 배열(taskArray)에서 property와 그 값으로 해당하는 객체를 찾는 함수 */
function findTaskObject(property, targetValue) {  // func(탐색하고자 하는 property, property 값)
  return taskArray.find((el) => { return el[property] === targetValue });
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
  }

  createTaskNode() {
    if (!this.title) {
      alert("할 일을 입력해주세요.");
      return;
    }

    // 체크박스 만들기
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // 체크박스 라벨 만들기
    const taskDiv = document.createElement("div");
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(document.createTextNode(this.title));
    taskDiv.appendChild(document.createElement("br"));
    taskDiv.classList.add("task");

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

  /* FIXME: 배열에서 삭제할 방법? */
  deleteTask() {
    deleteTaskObject(this);
    this.taskNode.remove();

    exportToLocalStorage();
  };

}

/* localStorage에 저장된 내용 불러오는 함수 */
function loadLocalStorage() {
  if (localStorage && localStorage.getItem("tasks")) {
    arr = JSON.parse(localStorage.getItem("tasks"));
    arr.forEach((obj) => {
      //FIXME: property 추가할 때 일일히 수정해야 하는 문제 있음
      const { title, isCompleted, dueDate, text } = obj;
      let parameter = [title, isCompleted, dueDate, text]
      let task = new Todo(...parameter);

      task.createTaskNode();

      const destClass = task.isCompleted ? "completed" : "ongoing";
      task.moveTask(destClass);
    });
  }
}

/* FIXME: 할일을 통째로 수정하지 말고, 변경 사항 있는 할일만 수정하도록 */
/* 할일을 localStorage에 저장하는 함수 */
function exportToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(taskArray));
};

function createTaskTags(targetNode, tags) {
  const tagDiv = targetNode.querySelector(".task-tags");

  tags.forEach((tag) => {
    const eachTag = document.createElement("label");
    eachTag.appendChild(document.createTextNode(tag));
    eachTag.className = "tags"

    tagDiv.appendChild(eachTag);
  })
}

/* 할일 목록 이벤트 핸들러 함수 */
function confTodo() {
  const newTask = document.querySelector("input[type=text]");
  const dueDate = document.querySelector("input[type=date]");
  const addButton = document.querySelector("input[type=button]");
  const taskLists = document.querySelector(".todo_list")
  const title = document.querySelector("body>header")
  const tagList = document.querySelector(".tag-list");

  // 새 할 일 추가(Enter)
  newTask.addEventListener("keyup", (e) => {
    const enter = 13;

    if (e.keyCode == enter) {
      let task = e.currentTarget.value;
      let expireDate = dueDate.value
      let newTodo = new Todo(task, 0, expireDate)

      newTodo.createTaskNode();
      newTodo.moveTask();
      newTask.value = ""; // 할일 입력란 지우기
    }
  });

  // 새 할 일 추가(버튼 클릭)
  addButton.addEventListener("click", () => {
    /* FIXME: Enter로 추가하는 이벤트 핸들러와 동일한데 함수 만들어서 코드 줄이면? */
    let task = newTask.value;
    let expireDate = dueDate.value
    let newTodo = new Todo(task, 0, expireDate)

    newTodo.createTaskNode();
    newTodo.moveTask();
    newTask.value = ""; // 할일 입력란 지우기

    exportToLocalStorage();
  });

  taskLists.addEventListener("click", (e) => {
    let currentNode, thisTask;
    // 완료 및 미완료 할일: 진행중, 완료 목록으로 이동
    console.log(e.target);
    if (e.target.matches("input[type=checkbox]")) {
      currentNode = e.target.closest("div:not(.task)");
      thisTask = findTaskObject("taskNode", currentNode);

      const destNodeClass = thisTask.isCompleted ? "ongoing" : "completed";
      thisTask.moveTask(destNodeClass)
    }

    // 태그 추가
    if (e.target.matches(".task")) {  // TODO: 기존 태그 삭제하기, taskArray와 연계
      let tags = [];
      const currentTags = taskLists.querySelectorAll("label.tags").forEach((node) => tags.push(node.innerText));
      console.log(tags); // 기존 태그
      const insertNewTags = prompt("태그를 추가하세요.(띄어쓰기로 구분)", tags);
      const tagArray = insertNewTags.match(/#((.*?)(?= )|(.*?)$)/g);
      currentNode = e.target.closest("div:not(.task)");
      createTaskTags(currentNode, tagArray);
    }

    // 할일 삭제
    if (e.target.matches(".close")) {
      currentNode = e.target.closest("section>div");
      thisTask = findTaskObject("taskNode", currentNode);
      thisTask.deleteTask();
    }

    exportToLocalStorage();
  })

  // 만료일 수정
  taskLists.addEventListener("change", (e) => {
    const nextDue = e.target.value;
    if (nextDue && e.target.matches(".extra>input")) {
      e.target.nextElementSibling.innerText = nextDue;
      const currentNode = e.target.closest("section>div");
      const thisTask = findTaskObject("taskNode", currentNode);
      thisTask.dueDate = nextDue;
      console.log(thisTask);
    }
    exportToLocalStorage();
  })

  // 할일 목록 제목 수정
  title.addEventListener("click", (e) => {
    if (e.target.matches(":is(img, h2")) {
      const newTitle = prompt("할일 목록의 제목을 수정하세요.");
      e.currentTarget.querySelector("h2").innerText = newTitle || "할 일 목록";
    }
  })

  // 태그별 필터링
  tagList.addEventListener("change", (e) => {
    console.log(tagList.querySelectorAll("input[type=checkbox]:checked"));

  })
}

loadLocalStorage();  // localStorage 내용 있으면 불러오기
confTodo();  // Todo 앱 화면 구성하기
