import React from 'react';
const { useState, useEffect, useRef, useCallback } = React;

const MemoDatePicker = React.memo(function DatePicker({ id, dueDate, onChange }) {
  return (
    <label className="dueDate" htmlFor={`datepicker ${id}`}>
      <input type="date" id={`datepicker ${id}`} onChange={onChange}></input>
      {dueDate}
    </label>
  );
});

const Task = React.memo(function (props) {
  const { onTitleClick, onChangeCompletion, onDelete, ...taskObj } = props;

  const propsDueDate = {
    id: taskObj.id,
    /* onChange: onChangeDueDate, */
    dueDate: taskObj.dueDate
  };

  return (
    <li className="task" id={taskObj.id}>
      <div className="task-label" onClick={() => { onTitleClick(taskObj) }}>
        <input
          type="checkbox"
          onChange={() => onChangeCompletion(taskObj)}
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

function TaskListSection({ sectionClass, taskArr, onChangeCompletion, onTitleClick, onDelete }) {
  const sectionName = (sectionClass === "ongoing") ? "진행중" : "완료";
  const tasks = taskArr.map((obj) => {
    return <Task
      {...obj}
      onChangeCompletion={onChangeCompletion}
      onTitleClick={onTitleClick}
      onDelete={onDelete}
      key={obj.id}
    />
  });

  return (
    <ul className={sectionClass}>
      <input type="checkbox" className="toggle-collapse" />
      <div className="toggle-icon"></div>
      <header>
        <h3>{sectionName}</h3>
      </header>
      {tasks}
    </ul>
  );
}

const TaskList = React.memo(function TaskList(props) {
  const { ongoing, completed, onTitleClick, toggleCompletion, onDelete } = props;

  useEffect(() => {
    /* console.log("미완료: ", ongoingArr);
    console.log("완료: ", completedArr); */
  }, []);

  const ongoingSect = {
    sectionClass: "ongoing",
    taskArr: ongoing,
    onChangeCompletion: toggleCompletion,
    onTitleClick: onTitleClick,
    onDelete: onDelete
  };
  const completedSect = {
    sectionClass: "completed",
    taskArr: completed,
    onChangeCompletion: toggleCompletion,
    onTitleClick: onTitleClick,
    onDelete: onDelete
  };

  return (
    <article className="todo_list">
      <TaskListSection {...ongoingSect} />
      <TaskListSection {...completedSect} />
    </article>
  );
});

export default TaskList;