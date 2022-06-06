import React from 'react';
import './AddNewItems.css';
const { useState, useEffect, useRef, useCallback } = React;

function InputField(props) {
  const { type, text, id, placeholder } = props;

  return <input type={type} value={text} id={id} placeholder={placeholder} />;
}

const AddNewTask = React.memo(function ({ title, callbacks }) {
  const { newTitle, newDueDate, addTask } = callbacks;

  return (
    <div>
      <header>
        <h2 id='todo-title'>할 일 목록</h2>
        <div id="edit-title"></div>
        <div className="toggle-dark">
          <p>다크 모드</p>
          <input type="checkbox" id="default" />
          <label className="switch" htmlFor="default" />
        </div>
      </header>
      <div id="add-task">
        <input type="text" placeholder="할 일을 입력해주세요." value={title} onChange={newTitle} />
        <input type="date" onChange={newDueDate} />
        <input type="button" value="추가하기" onClick={addTask} />
      </div>
    </div>

  );
});

const AddNewTags = React.memo(function (props) {
  const { tagText, callbacks, children } = props;

  return (
    <div className="tag-box">
      <div className="tag-conf">
        <p>태그</p>
        <input type="text" id="createTag" placeholder="ex. 태그1 태그2" value={tagText} onChange={callbacks.newTagName} />
        <input type="button" id="addTag" value="태그 추가" onClick={callbacks.addTag}/>
        <input type="button" id="deleteTag" value="태그 삭제" />
      </div>
      <div className="tag-list">
        {children}
      </div>
    </div>
  );
});

export { AddNewTask, AddNewTags };