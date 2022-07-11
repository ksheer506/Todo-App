import React, { useEffect, useState } from "react";

const Header = () => {
  const [mainTitle, setMainTitle] = useState<string>("");

  /* 앱 제목 변경 */
  const EditMainTitle = () => {
    const newTitle = prompt("수정할 제목을 입력해주세요.");

    if (!newTitle) return;
    setMainTitle(newTitle);
  };

  useEffect(() => {
    const mainTitle = localStorage.getItem("mainTitle") || "할일 목록";
    
    setMainTitle(mainTitle);
  }, []);

  useEffect(() => {
    if (mainTitle) {
      localStorage.setItem("mainTitle", mainTitle);
    }
  }, [mainTitle]);

  return (
    <header>
      <h2 id="todo-title">{mainTitle}</h2>
      <button id="edit-title" aria-label="앱 제목 변경" onClick={EditMainTitle}></button>
      <div className="toggle-dark">
        <p>다크 모드</p>
        <input type="checkbox" id="default" />
        <label className="switch" htmlFor="default" />
      </div>
    </header>
  );
};

export default Header;
