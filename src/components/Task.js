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
  const { title, dueDate, id, isCompleted, text, onChangeCompletion, onTitleClick } = props;
  const propsDueDate = {
    id: props.id,
    /* onChange: onChangeDueDate, */
    dueDate: dueDate
  };

  return (
    <li className="task" id={id}>
      <div className="task-label" onClick={() => { onTitleClick(props) }}>
        <input
          type="checkbox"
          onChange={() => onChangeCompletion(props)}
          checked={isCompleted} />
        {title}
      </div>
      <div className="task-tags"></div>
      <div className="extra">
        <MemoDatePicker {...propsDueDate} />
        <div className="close" tabIndex="0">x</div>
      </div>
    </li>
  );
});

function TaskListSection({ sectionClass, taskArr, onChangeCompletion, onTitleClick }) {
  const sectionName = (sectionClass === "ongoing") ? "진행중" : "완료";
  const tasks = taskArr.map((obj) => {
    return <Task {...obj} onChangeCompletion={onChangeCompletion} onTitleClick={onTitleClick} key={obj.id} />
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
  const { ongoing, completed, onTitleClick, toggleCompletion } = props;

  useEffect(() => {
    /* console.log("미완료: ", ongoingArr);
    console.log("완료: ", completedArr); */
  }, []);

  const ongoingSect = {
    sectionClass: "ongoing",
    taskArr: ongoing,
    onChangeCompletion: toggleCompletion,
    onTitleClick: onTitleClick
  };
  const completedSect = {
    sectionClass: "completed",
    taskArr: completed,
    onChangeCompletion: toggleCompletion,
    onTitleClick: onTitleClick
  };

  return (
    <article className="todo_list">
      <TaskListSection {...ongoingSect} />
      <TaskListSection {...completedSect} />
    </article>
  );
});

export default TaskList;