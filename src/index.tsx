import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { taskDB, tagDB } from "./interfaces/db";

/* localStorage에 저장된 데이터(할일 제목, 다크모드 여부)를 불러오는 함수 */
function loadLocalStorage() {
  const userTitle = localStorage.getItem("title") || "할 일 목록";
  const userDarkMode = localStorage.getItem("dark-mode");

  if (userTitle) {
    // Title 변경
  }
  /* if (userDarkMode === 'true') { // 유저 다크모드 적용
    dom.darkToggler.setAttribute('checked', true);
    darkModeSetter(true);
  } */
}

/* 다크모드 토글 함수 */
/* function darkModeSetter(checked = false) {
  document.documentElement.setAttribute("dark-theme", checked);
  localStorage.setItem("dark-mode", checked);
} */

function rootRender(tasks: Array<taskDB>, tags: Array<tagDB>) {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <App tasks={tasks} tagList={tags} />
    </React.StrictMode>
  );
}

export default rootRender;
