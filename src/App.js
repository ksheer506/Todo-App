import React from 'react';
import { useEffect, useCallback, useMemo, useState } from 'react';
import { accessTaskDB, accessTagDB } from './modules/db/access.js'

import { TaskListSection, Task } from "./components/Task.js";
import { AddNewTask, AddNewTags } from "./components/AddNewItems.js"
import SideMenu from "./components/SideMenu.js"
import Tag from "./components/Tag.js"

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

function findObj(data, id) {
  return data.filter(taskObj => taskObj.id === id)[0];
};

function mappingComponent(arr, Comp, extraProps) {
  return arr.map((props) => (<Comp {...props}{...extraProps} key={props.id} />))
}

function App({ tasks, tagList }) {
  const [newTask, setNewTask] = useState({ title: "", dueDate: null });
  const [newTag, setNewTag] = useState("");
  const [side, setSide] = useState(null);
  const [tags, setTags] = useState(tagList);
  const [ongoingArr, setOngoingArr] = useState(tasks.filter(obj => !obj.isCompleted));
  const [completedArr, setCompletedArr] = useState(tasks.filter(obj => obj.isCompleted));

  console.log(tags);

  /* 할일 사이드 메뉴에서 보기 */
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
      if (!newTask.title) {
        alert('할 일을 입력해주세요.');
        return;
      }

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

  /* 2. 할일 완료/미완료 여부 변경 */
  const toggleCompletion = useCallback((taskObj) => {
    const { isCompleted, id } = taskObj;
    const modifiedTaskObj = { ...taskObj, isCompleted: !taskObj.isCompleted };

    accessTaskDB('modify', modifiedTaskObj);  // DB 수정

    if (!isCompleted) {  // State: ongoingArr, completedArr 변경
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

  /* 3. 할일 삭제 */
  const deleteTask = useCallback((taskId) => {
    const taskObj = findObj(tasks, taskId);
    const { isCompleted } = taskObj;

    accessTaskDB('delete', taskObj);
    if (isCompleted) { // TODO: 할일 배열을 하나로 관리하는 방법?
      setCompletedArr(prevCompleted => {
        return prevCompleted.filter(taskObj => taskObj.id !== taskId);
      });

      return
    }

    setOngoingArr(prevOngoing => {
      return prevOngoing.filter(taskObj => taskObj.id !== taskId);
    });
  }, [ongoingArr, completedArr]);

  /* 4. 할일 만료일 변경 */
  const changeDueDate = useCallback((e, taskId) => {
    /* console.log("이벤트 핸들러에서의 completedArr", completedArr) */
    const taskObj = findObj(tasks, taskId);
    const { isCompleted } = taskObj;
    const editedTask = { ...taskObj, dueDate: e.target.value }

    accessTaskDB('modify', editedTask);

    if (isCompleted) {
      const nextCompleted = completedArr.map(taskObj =>
        (taskObj.id === taskId) ? editedTask : taskObj
      );
      setCompletedArr(nextCompleted);

      return
    }

    const nextOngoing = ongoingArr.map(taskObj =>
      (taskObj.id === taskId) ? editedTask : taskObj
    );
    setOngoingArr(nextOngoing);

  }, [/* ongoingArr, completedArr */]);

  useEffect(() => { console.log("completedArr 변경됨", completedArr); }, [completedArr])

  const addTagCallbacks = useCallback({
    newTagName: (e) => {
      setNewTag(e.target.value);
    },
    addTag: () => {
      // [{tagText: "태그1", id: "태그1", assignedTask: []}, { ... }, ...]
      const newTags = newTag
        .match(/[^#\s]\S{0,}[^\s,]/g)
        .map((tagText) => (
          {
            tagText: tagText,
            id: tagText,
            assignedTask: []
          }
        ));

      accessTagDB("add", newTags);  // DB 변경
      setNewTag("");  // 태그명 비우기
    }
  }, [newTag]);

  const deleteTag = (tagText) => {
    const tagObj = findObj(tags, tagText);

    accessTagDB('delete', tagObj);
  };

  const filterByTag = () => {};


  const taskCallbacks = {
    onTitleClick: showToSide,
    onChangeCompletion: toggleCompletion,
    onDelete: deleteTask,
    onChangeDueDate: changeDueDate,
  };

  const tagCallbacks = {
    onClick: deleteTag,
    onChecked: filterByTag,
  };

  const ongoingTasks = useMemo(() => mappingComponent(ongoingArr, Task, taskCallbacks), [ongoingArr]);
  const completedTasks = useMemo(() => mappingComponent(completedArr, Task, taskCallbacks), [completedArr])

  return (
    <div className="front">
      <main>
        <AddNewTask {...newTask} callbacks={addTaskCallbacks} />
        <AddNewTags tagText={newTag} callbacks={addTagCallbacks}>
          {mappingComponent(tags, Tag, { makeChk: true })}
        </AddNewTags>
        <article className="todo_list">
          <TaskListSection sectionClass="ongoing">
            {ongoingTasks}
          </TaskListSection>
          <TaskListSection sectionClass="completed">
            {completedTasks}
          </TaskListSection>
        </article>
      </main>
      <SideMenu {...side} />
    </div >
  );
}


export default App;