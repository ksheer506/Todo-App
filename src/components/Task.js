import React from 'react';
const { useState, useEffect, useRef, useCallback } = React;

const MemoDatePicker = React.memo(function DatePicker({ id, dueDate, onChange }) {
  return (
    <label className="dueDate" htmlFor={`datepicker ${id}`}>
      <input type="date" id={`datepicker ${id}`} onChange={(e) => onChange(e, id)} />
      {dueDate}
    </label>
  );
});

const Task = React.memo(function (props) {
  const { onTitleClick, onChangeCompletion, onDelete, onChangeDueDate, ...taskObj } = props;

  const propsDueDate = {
    id: taskObj.id,
    onChange: onChangeDueDate,
    dueDate: taskObj.dueDate
  };

  return (
    <li className="task" id={taskObj.id}>
      <div className="task-label" onClick={() => { onTitleClick(taskObj) }}>  {/* FIXME: id 쓰도록 */}
        <input
          type="checkbox"
          onChange={() => onChangeCompletion(taskObj.id)}
          checked={taskObj.isCompleted} />
        {taskObj.title}
      </div>
      <div className="task-tags"></div>
      <div className="extra">
        <MemoDatePicker {...propsDueDate} />
        <div className="close" tabIndex="0" onClick={() => { onDelete(taskObj.id) }}>x</div>
      </div>
    </li>
  );
});

const TaskListSection = React.memo(function ({ sectionClass, children }) {
  const sectionName = (sectionClass === "ongoing") ? "진행중" : "완료";

  return (
    <ul className={sectionClass}>
      <input type="checkbox" className="toggle-collapse" />
      <div className="toggle-icon"></div>
      <header>
        <h3>{sectionName}</h3>
      </header>
      {children}
    </ul>
  );
})


export { TaskListSection, Task };