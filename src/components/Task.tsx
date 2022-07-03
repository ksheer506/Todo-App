import React from "react";
import { taskDB } from "../interfaces/db";
import { datePickerT, taskList } from "../interfaces/task";

import "./Task.css";

interface callbackT {}

const MemoDatePicker = React.memo(function DatePicker({ id, dueDate, onChange }: datePickerT) {
  return (
    <label className="dueDate" htmlFor={`datepicker ${id}`}>
      <input type="date" id={`datepicker ${id}`} onChange={(e) => onChange(e, id)} />
      {dueDate}
    </label>
  );
});

const Task = React.memo(function (props: taskDB) {
  const { onTitleClick, onEditTask, onDelete, ...taskObj } = props;

  const propsDueDate = {
    id: taskObj.id,
    dueDate: taskObj.dueDate,
  };

  return (
    <li className="task" id={taskObj.id}>
      <div className="task-label">
        {/* FIXME: id 쓰도록 */}
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
        <div
          className="close"
          onClick={() => {
            onDelete(taskObj.id);
          }}
        >
          x
        </div>
      </div>
    </li>
  );
});

const TaskListSection = React.memo(function ({ sectionClass, children }: taskList) {
  const sectionName = sectionClass === "ongoing" ? "진행중" : "완료";

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
});

export { TaskListSection, Task };
