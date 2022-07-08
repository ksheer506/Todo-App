import React from "react";

import { DatePickerType, TaskList } from "../interfaces/task";
import { TaskPropsType } from "../interfaces/task";

import "./Task.css";


const MemoDatePicker = React.memo(function DatePicker({ id, dueDate, onChange }: DatePickerType) {
  return (
    <label className="dueDate">
      <input type="date" onChange={(e) => onChange(e, id)} />
      {dueDate}
    </label>
  );
});

const Task = React.memo(function (props: TaskPropsType) {
  const { onTitleClick, onEditTask, onDelete, ...taskObj } = props;

  const propsDueDate = {
    id: taskObj.id,
    dueDate: taskObj.dueDate,
  };

  return (
    <li className="task" id={taskObj.id}>
      <div className="task-label">
        <input
          type="checkbox"
          onChange={() => onEditTask(taskObj.id, { field: "isCompleted", newValue: !taskObj.isCompleted })}
          checked={taskObj.isCompleted}
        />
        <span
          className="task-title"
          onClick={() => {
            onTitleClick(taskObj.id);
          }}
        >
          {taskObj.title}
        </span>
      </div>
      <div className="task-tags"></div>
      <div className="extra">
        <MemoDatePicker
          {...propsDueDate}
          onChange={(e) => onEditTask(taskObj.id, { field: "dueDate", newValue: e.target.value })}
        />
        <button
          className="close"
          aria-label="할일 삭제"
          onClick={() => {
            onDelete(taskObj.id);
          }}
        >x</button>
      </div>
    </li>
  );
});

const TaskListSection = React.memo(function ({ sectionClass, children }: TaskList) {
  const sectionName = sectionClass === "ongoing" ? "진행중" : "완료";

  return (
    <ul className={sectionClass}>
      <input type="checkbox" aria-label={`${sectionName} 목록 접기`} className="toggle-collapse" />
      <div className="toggle-icon"></div>
      <header>
        <h3>{sectionName}</h3>
      </header>
      {children}
    </ul>
  );
});

export { TaskListSection, Task };
