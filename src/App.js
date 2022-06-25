import React from 'react';
import { useEffect, useCallback, useMemo, useState } from 'react';
import { accessTaskDB, accessTagDB } from './modules/db/access.js';
import { FilterByTagsDB } from './modules/db/fetching.js'

import './App.css';
import { TaskListSection, Task } from "./components/Task.js";
import { AddNewTask, AddNewTags } from "./components/AddNewItems.js"
import SideMenu from "./components/SideMenu.js"
import { Tag, TagList } from "./components/Tag.js"

class Todo {
  constructor(object) {
    this.id = object.id || `id_${Date.now()}`;
    this.title = object.title;
    this.isCompleted = object.isCompleted || false;
    this.dueDate = object.dueDate || '';
    this.text = object.text || '';
    this.tags = object.tags || [];
  }
}

function findObj(data, id) {
  return data.filter(taskObj => taskObj.id === id)[0];
};

function mappingComponent(arr, Component, extraProps) {
  return arr.map((props) => (<Component {...props}{...extraProps} key={props.id} />))
}

function App({ tasks, tagList }) {
  const [currentWork, setCurrentWork] = useState({ action: null, task: {}, tag: {} });
  const [side, setSide] = useState({ status: false });
  const [tags, setTags] = useState(tagList);
  const [selectedTags, setSelectedTags] = useState([]);
  const [taskArr, setTaskArr] = useState(tasks); // TODO:

  /* 할일 사이드 메뉴에서 보기 */
  const showToSide = useCallback((props) => {
    setSide(prev => ({ status: true, ...props }));
  }, []);

  /* 1. 새 할일 추가 */
  const addTask = useCallback((task) => {  // TODO: Task 관련 이벤트 핸들러가 비슷비슷: useReducer로 하나로 통합?
    if (!task.title) {
      alert('할 일을 입력해주세요.');
      return;
    }

    const newTaskInst = new Todo(task);

    setCurrentWork({ action: "Task/ADD", task: newTaskInst });
    setTaskArr(prev => [...prev, newTaskInst]);
  }, []);

  /* 2. 할일 완료/미완료 여부 변경 */
  const toggleCompletion = useCallback((taskId) => {
    const taskObj = findObj(taskArr, taskId);
    const editedTask = { ...taskObj, isCompleted: !taskObj.isCompleted };

    setCurrentWork({ action: "Task/MODIFY", task: editedTask }); // 어따 쓰나?
    setTaskArr(prev => {
      return prev.map((task) => {
        if (task.id === taskId) {
          return editedTask;
        }
        return task;
      })
    });
  }, [taskArr]);

  /* 3. 할일 삭제 */
  const deleteTask = useCallback((taskId) => {
    const taskObj = findObj(taskArr, taskId);

    setCurrentWork({ action: "Task/DELETE", task: taskObj });
    setTaskArr(prev => {
      return prev.filter(task => task.id !== taskId);
    });
  }, [taskArr]);

  /* 4. 할일 만료일 변경 */
  const changeDueDate = useCallback((e, taskId) => {
    const taskObj = findObj(taskArr, taskId);
    const editedTask = { ...taskObj, dueDate: e.target.value };

    setCurrentWork({ action: "Task/MODIFY", task: editedTask });
    setTaskArr(prev => {
      return prev.map((task) => {
        if (task.id === taskId) {
          return editedTask;
        }
        return task;
      })
    });
  }, [taskArr]);

  /* DB 업데이트 */
  useEffect(() => {
    const { action, task, tag } = currentWork;
    if (!action) return;

    const [db, operation] = action.match(/\w{1,10}/g);

    if (db === "Task") {
      accessTaskDB(operation, task);
    } else {
      accessTagDB(operation, tag);
    }
  }, [currentWork]);


  const addTags = useCallback((newTag) => {
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

    setCurrentWork({ action: "Tag/ADD", tag: newTags });
    setTags((prev) => [...prev, ...newTags])
  }, []);

  const deleteTag = (tagText) => {
    const tagObj = findObj(tags, tagText);

    accessTagDB('delete', tagObj);
  };

  const filterByTag = async (selection) => {
    const { isSelected, tag } = selection;

    if (!isSelected) {
      setSelectedTags((prev) => {
        return prev.filter((el) => el !== tag)
      });
    }
    setSelectedTags((prev) => [...prev, tag]);
    console.log(selectedTags);
  };

  useEffect(() => {
    if (selectedTags.length) {
      console.log(FilterByTagsDB(selectedTags));
    }

  }, [selectedTags])


  const taskCallbacks = {
    onTitleClick: showToSide,
    onChangeCompletion: toggleCompletion,
    onDelete: deleteTask,
    onChangeDueDate: changeDueDate,
  };

  const tagCallbacks = {
    onDelete: deleteTag,
    onFiltering: filterByTag,
  };

  const ongoingTasks = useMemo(() => {
    const ongoing = taskArr.filter((task) => task.isCompleted === false);
    return mappingComponent(ongoing, Task, taskCallbacks)
  }, [taskArr]);
  const completedTasks = useMemo(() => {
    const completed = taskArr.filter((task) => task.isCompleted === true);
    return mappingComponent(completed, Task, taskCallbacks)
  }, [taskArr]);

  return (
    <>
      <div id="background" className={side.status ? "mobile": null}></div>
      <main className={side ? "sideshow" : ""}>
        <AddNewTask addTask={addTask} />
        <AddNewTags addTags={addTags}>
          <TagList callbacks={tagCallbacks}>
            {mappingComponent(tags, Tag, { makeChk: true, callbacks: tagCallbacks })}
          </TagList>
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
      <SideMenu {...side} onClick={setSide} />
    </>
  );
}


export default App;