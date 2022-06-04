import { useCallback, useMemo, useState } from 'react';
import { accessTaskDB, accessTagDB } from './modules/db/access.js'


import TaskList from "./components/Task.js";
import { AddNewTask, AddNewTags } from "./components/AddNewItems.js"
import SideMenu from "./components/SideMenu.js"


class Todo {
  constructor(object) {
    this.id = object.id || `id_${Date.now()}`;
    this.title = object.title;
    this.isCompleted = object.isCompleted || false;
    this.dueDate = object.dueDate || '';
    this.text = object.text || '';
    this.tags = object.tags || [];
  }

  toggleCompletion() {
    this.isCompleted = !this.isCompleted;
  }

  addNewTag(tag) {
    this.tags.push(tag);
  }
}

function findTaskObj(tasks, taskId) {
  return tasks.filter(taskObj => taskObj.id === taskId)[0];
};


function App({ tasks }) {
  const [newTask, setNewTask] = useState({ title: "", dueDate: null });
  const [side, setSide] = useState(null);
  const [ongoingArr, setOngoingArr] = useState(tasks.filter(obj => !obj.isCompleted));
  const [completedArr, setCompletedArr] = useState(tasks.filter(obj => obj.isCompleted));

  const showToSide = useCallback((props) => {
    setSide(props);
  }, []); // deps로 side를 지정하지 않는다면?

  /* 1. 새 할일 추가 */
  const addTaskCallbacks = useCallback({
    newTitle: (e) => {
      setNewTask(prevTask => ({ ...prevTask, title: e.target.value }));
    },
    newDueDate: (e) => {
      setNewTask(prevTask => ({ ...prevTask, dueDate: e.target.value }))
    },
    addTask: (e) => {
      const newTaskInst = new Todo(newTask);

      setOngoingArr(prevOngoing => {
        const nextOngoing = prevOngoing.slice();
        nextOngoing.push(newTaskInst);

        return nextOngoing;
      });

      accessTaskDB("add", newTaskInst);  // DB 변경
      setNewTask({ title: "", dueDate: null });  // 제목, 만료일 비우기
    }
  }, [newTask]);

  /* 1. 할일 완료/미완료 여부 변경 */
  const toggleCompletion = useCallback((taskObj) => {
    const { isCompleted, id } = taskObj;
    const modifiedTaskObj = { ...taskObj, isCompleted: !taskObj.isCompleted };

    accessTaskDB('modify', modifiedTaskObj);  // DB 수정

    // State: ongoingArr, completedArr 변경
    if (!isCompleted) {
      setOngoingArr(prevOngoing => {
        return prevOngoing.filter(taskObj => taskObj.id !== id);
      });
      setCompletedArr(prevCompleted => {
        const nextCompleted = prevCompleted.slice();
        nextCompleted.push(modifiedTaskObj);
        return nextCompleted;
      });

      return
    }

    setCompletedArr(prevCompleted => {
      return prevCompleted.filter(taskObj => taskObj.id !== id);
    });
    setOngoingArr(prevOngoing => {
      const nextOngoing = prevOngoing.slice();
      nextOngoing.push(modifiedTaskObj);
      return nextOngoing;
    });
  }, [ongoingArr, completedArr]);

  /* 2. 할일 삭제 */
  const deleteTask = useCallback((taskId) => {
    const taskObj = findTaskObj(tasks, taskId);

    accessTaskDB('delete', taskObj);
    setCompletedArr(prevCompleted => {  // TODO: 할일 배열을 하나로 관리하는 방법?
      return prevCompleted.filter(taskObj => taskObj.id !== taskId);
    });
    setOngoingArr(prevOngoing => {
      return prevOngoing.filter(taskObj => taskObj.id !== taskId);
    });

  }, [ongoingArr, completedArr]);

  return (
    <div className="front">
      <main>
        <AddNewTask {...newTask} callbacks={addTaskCallbacks} />
        <AddNewTags />
        <TaskList
          ongoing={ongoingArr}
          completed={completedArr}
          toggleCompletion={toggleCompletion}
          onTitleClick={showToSide}
          onDelete={deleteTask}
        />
      </main>
      <SideMenu {...side} />
    </div>
  );
}

export default App;