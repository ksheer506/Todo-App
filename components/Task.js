/* const { useState, useEffect, useRef, useCallback } = React; */

const taskObj1 = [
  { title: "할일1", id: "id_1", dueDate: "2022-05-25", text: "텍스트1", isCompleted: false },
  { title: "할일2", id: "id_2", dueDate: "2022-04-25", text: "텍스트2", isCompleted: false },
  { title: "할일3", id: "id_3", text: "텍스트3", isCompleted: false },
  { title: "할일5", id: "id_5", dueDate: "2022-05-25", text: "텍스트1", isCompleted: true },
  { title: "할일6", id: "id_6", dueDate: "2022-04-25", text: "텍스트2", isCompleted: true },
  { title: "할일7", id: "id_7", text: "텍스트3", isCompleted: true },
];

const MemoDatePicker = React.memo(function DatePicker({ id, dueDate, onChange }) {
  return (
    <label className="dueDate" htmlFor={`datepicker ${id}`}>
      <input type="date" id={`datepicker ${id}`} onChange={onChange}></input>
      {dueDate}
    </label>
  );
});

function Task(props) {
  const { title, dueDate, id, isCompleted, text, onChangeCompletion } = props;
  /* const [title, setTitle] = React.useState(props.title); */
  /* const [dueDate, setDueDate] = React.useState(props.dueDate); */

  const onChangeDueDate = (e) => {
    setDueDate(e.target.value);
  };

  const chkBox = useRef(null);
  const propsDueDate = {
    id: props.id,
    onChange: onChangeDueDate,
    dueDate: dueDate
  };

  return (
    <li className="task" id={id}>
      <div className="task-label">
        <input
          type="checkbox"
          onChange={() => onChangeCompletion(props)}
          checked={isCompleted}
          ref={chkBox} />
        {title}
      </div>
      <div className="task-tags"></div>
      <div className="extra">
        <MemoDatePicker {...propsDueDate} />
        <div className="close" tabIndex="0">x</div>
      </div>
    </li>
  );
};

function TaskListSection({ sectionClass, taskArr, onChangeCompletion }) {
  const sectionName = (sectionClass === "ongoing") ? "진행중" : "완료";
  const tasks = taskArr.map((obj) => {
    return <Task {...obj} onChangeCompletion={onChangeCompletion} key={obj.id} />
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

function TaskList({ taskArr }) {
  const [ongoingArr, setOngoingArr] = useState(taskArr.filter(obj => !obj.isCompleted));
  const [completedArr, setCompletedArr] = useState(taskArr.filter(obj => obj.isCompleted));

  const onChangeCompletion = (taskProps) => {
    const { isCompleted, id } = taskProps;
    const modifiedTaskProps = { ...taskProps, isCompleted: !taskProps.isCompleted };

    if (!isCompleted) {
      setOngoingArr(prevOngoing => {
        return prevOngoing.filter(taskObj => taskObj.id !== id);
      });
      setCompletedArr(prevCompleted => {
        const refreshedCompleted = prevCompleted.slice();
        refreshedCompleted.push(modifiedTaskProps);
        return refreshedCompleted;
      });

      return
    }

    setCompletedArr(prevCompleted => {
      return prevCompleted.filter(taskObj => taskObj.id !== id);
    });
    setOngoingArr(prevOngoing => {
      const refreshedOngoing = prevOngoing.slice();
      refreshedOngoing.push(modifiedTaskProps);
      return refreshedOngoing;
    });

  };

  useEffect(() => {
    /* console.log("미완료: ", ongoingArr);
    console.log("완료: ", completedArr); */
  }, [ongoingArr, completedArr]);


  const ongoingSect = {
    sectionClass: "ongoing",
    taskArr: ongoingArr,
    onChangeCompletion: onChangeCompletion
  };
  const completedSect = {
    sectionClass: "completed",
    taskArr: completedArr,
    onChangeCompletion: onChangeCompletion
  };

  console.log("미완료: ", ongoingArr);
  console.log("완료: ", completedArr);

  return (
    <article className="todo_list">
      <TaskListSection {...ongoingSect} />
      <TaskListSection {...completedSect} />
    </article>
  );
}

ReactDOM.render(<TaskList taskArr={taskObj1} />, document.getElementById("root"));