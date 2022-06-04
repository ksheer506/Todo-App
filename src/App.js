import TaskList from "./components/Task.js";
import { AddNewTask, AddNewTags } from "./components/AddNewItems.js"
import SideMenu from "./components/SideMenu.js"
import { useCallback, useMemo, useState } from "react";



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

function App({ tasks }) {
  const [newTask, setNewTask] = useState({ title: "", dueDate: null });
  const [side, setSide] = useState(null);
  const [ongoingArr, setOngoingArr] = useState(tasks.filter(obj => !obj.isCompleted));
  const [completedArr, setCompletedArr] = useState(tasks.filter(obj => obj.isCompleted));
  console.log(tasks);

  const showToSide = useCallback((props) => {
    setSide(props);
  }, []); // deps로 side를 지정하지 않는다면?

  const addTaskCallbacks = useCallback({
    newTitle: (e) => {
      setNewTask(prevTask => ({ ...prevTask, title: e.target.value }));
      console.log(newTask);
    },
    newDueDate: (e) => {
      setNewTask(prevTask => ({ ...prevTask, dueDate: e.target.value }))
    },
    addTask: (e) => {
      const newTaskInst = new Todo(newTask);
      console.log(newTaskInst);
      setOngoingArr(prevOngoing => {
        const nextOngoing = prevOngoing.slice();
        nextOngoing.push(newTaskInst);

        return nextOngoing;
      });
      setNewTask({ title: "", dueDate: null });
    }
  }, [newTask]);

  const toggleCompletion = useCallback((taskProps) => {
    const { isCompleted, id } = taskProps;
    const modifiedTaskProps = { ...taskProps, isCompleted: !taskProps.isCompleted };

    if (!isCompleted) {
      setOngoingArr(prevOngoing => {
        return prevOngoing.filter(taskObj => taskObj.id !== id);
      });
      setCompletedArr(prevCompleted => {
        const nextCompleted = prevCompleted.slice();
        nextCompleted.push(modifiedTaskProps);
        return nextCompleted;
      });

      return
    }

    setCompletedArr(prevCompleted => {
      return prevCompleted.filter(taskObj => taskObj.id !== id);
    });
    setOngoingArr(prevOngoing => {
      const nextOngoing = prevOngoing.slice();
      nextOngoing.push(modifiedTaskProps);
      return nextOngoing;
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
        />
      </main>
      <SideMenu {...side} />
    </div>
  );
}

export default App;
