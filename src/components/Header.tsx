import React, { useEffect, useState } from "react";
import { useDarkMode, useLocalStorage } from "../custom-hooks";

import "./Header.css"

const Header = () => {
  const [mainTitle, setMainTitle] = useLocalStorage("mainTitle", "할일 목록");
  const [darkMode, setDarkMode] = useDarkMode();
  /* 앱 제목 변경 */
  const EditMainTitle = () => {
    const newTitle = prompt("수정할 제목을 입력해주세요.");

    if (!newTitle) return;
    setMainTitle(newTitle);
  };

  return (
    <header>
      <h2 id="todo-title">{mainTitle}</h2>
      <button id="edit-title" aria-label="앱 제목 변경" onClick={EditMainTitle}></button>
      <div className="toggle-dark">
        <span>다크 모드</span>
        <input
          type="checkbox"
          id="default"
          checked={darkMode}
          onChange={() => setDarkMode()}
        />
        <label className="switch" htmlFor="default" />
      </div>
    </header>
  );
};

export default Header;
