// 새 할 일 목록 생성
let variable = 1;

const addToList = function innerFunc() {
  let checkbox, label, close, div, idNum;
  

  if (localStorage.getItem("idNumber")) {
      idNum = Number(localStorage.getItem("idNumber")) + 1;} 
  else {
      idNum = 0;
    }

  function makeTask(newTask, destList) {

    if (!newTask) {
      alert("할 일을 입력해주세요.");
      return;
    }

    localStorage.setItem("idNumber", idNum);
    // 체크박스 만들기
    checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    // 체크박스 라벨 만들기
    label = document.createElement("label");
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(newTask));
    label.appendChild(document.createElement("br"));
    label.classList.add("task");
    // 제거 버튼 만들기
    close = document.createElement("div")
    close.appendChild(document.createTextNode("x"));
    close.className = "close";

    div = document.createElement("div");
    div.appendChild(label);
    div.appendChild(close);

    destList.appendChild(div);

    idNum++;
  }

  function moveTask(task, destList) {
    destList.appendChild(task.parentNode.parentNode);
      if (destList.className === "completed") {
        task.setAttribute("checked", "1");
      }
      else if (destList.className === "todo") {
        task.removeAttribute("checked");
      }

      localStorage.setItem("completed", document.querySelector("div.completed").innerHTML)
      localStorage.setItem("ongoing", document.querySelector("div.todo").innerHTML)
  }

  function deleteTask(task) {
    task.parentNode.remove();
    localStorage.setItem("completed", document.querySelector("div.completed").innerHTML)
    localStorage.setItem("ongoing", document.querySelector("div.todo").innerHTML)
  }

  innerFunc.makeTask = makeTask;
  innerFunc.moveTask = moveTask;
  innerFunc.deleteTask = deleteTask;
  
};
addToList();

document.addEventListener("DOMContentLoaded", () => {
  const newTask = document.querySelector("input[type=text]");
  const addButton = document.querySelector("input[type=button]");
  const todoList = document.querySelector("div.todo");
  const completedList = document.querySelector("div.completed");

//   fixme: local storage 호환 여부 + 내용 존재 여부
    if (localStorage.length > 0) {
        if (localStorage.getItem("ongoing")) {
            todoList.innerHTML = localStorage.getItem("ongoing");
        }
        if(localStorage.getItem("completed")) {
            completedList.innerHTML = localStorage.getItem("completed");
        }
    }

  // 새 할 일 추가(Enter)
  newTask.addEventListener("keyup", (e) => {
    const enter = 13;

    if (e.keyCode == enter) {
      let todo = e.currentTarget.value;
      addToList.makeTask(todo, todoList);
      newTask.value = ""
    }
  });

  // 새 할 일 추가(버튼 클릭)
  addButton.addEventListener("click", () => {
    let todo = newTask.value;
    addToList.makeTask(todo, todoList);
    newTask.value = "";
  });

  // 완료된 일 완료 목록으로 이동
  todoList.addEventListener("click", (e) => {
    if (e.target && e.target.matches("input[type=checkbox]")) {
      const eachTodo = todoList.querySelector("label>input:checked");
      addToList.moveTask(eachTodo, completedList);
    }
  });

  // 미완료 일 다시 진행중 목록으로 이동
  completedList.addEventListener("click", (e) => {
    if (e.target && e.target.matches("input[type=checkbox]")) {
      const eachTodo = completedList.querySelector("label>input:not(checked)");
      addToList.moveTask(eachTodo, todoList)
    }
  });

  document.addEventListener('click', (e) => {
    if(e.target && e.target.matches("div.close")) {
      addToList.deleteTask(e.target);
    }
  })

});
