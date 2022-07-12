import React from "react";

import { DatePicker } from "../interfaces/task";
import { TaskProps } from "../interfaces/task";

import "./Task.css";

const MemoDatePicker = React.memo(function DatePicker({ id, dueDate, onChange }: DatePicker) {
  return (
    <label className="dueDate">
      <input type="date" onChange={(e) => onChange(e, id)} />
      {dueDate}
    </label>
  );
});

const Task = React.memo(function (props: TaskProps) {
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
        >
          x
        </button>
      </div>
    </li>
  );
});



export { Task };
