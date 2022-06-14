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
  const [currentTask, setCurrentTask] = useState({ action: null, task: {} });
  const [newTag, setNewTag] = useState("");
  const [side, setSide] = useState(null);
  const [tags, setTags] = useState(tagList);
  const [taskArr, setTaskArr] = useState(tasks); // TODO:

  /* 할일 사이드 메뉴에서 보기 */
  const showToSide = useCallback((props) => {
    setSide(props);
  }, []); // deps로 side를 지정하지 않는다면?

  /* 1. 새 할일 추가 */
  const addTask = useCallback((task) => {  // TODO: Task 관련 이벤트 핸들러가 비슷비슷: useReducer로 하나로 통합?
    if (!task.title) {
      alert('할 일을 입력해주세요.');
      return;
    }

    const newTaskInst = new Todo(task);

    setCurrentTask({ action: "ADD", task: newTaskInst });
    setTaskArr(prev => [...prev, newTaskInst]);
  }, []);

  /* 2. 할일 완료/미완료 여부 변경 */
  const toggleCompletion = useCallback((taskId) => {
    const taskObj = findObj(taskArr, taskId);
    const editedTask = { ...taskObj, isCompleted: !taskObj.isCompleted };

    setCurrentTask({ action: "MODIFY", task: editedTask }); // 어따 쓰나?
    setTaskArr(prev => {
      return prev.map((task) => {
        if (task.id === taskId) {
          return editedTask;
        }
        return task;
      })
    });
  }, []);

  /* 3. 할일 삭제 */
  const deleteTask = useCallback((taskId) => {
    const taskObj = findObj(taskArr, taskId);

    setCurrentTask({ action: "DELETE", task: taskObj });
    setTaskArr(prev => {
      return prev.filter(task => task.id !== taskId);
    });
  }, []);

  /* 4. 할일 만료일 변경 */
  const changeDueDate = useCallback((e, taskId) => {
    const taskObj = findObj(taskArr, taskId);
    const editedTask = { ...taskObj, dueDate: e.target.value };

    setCurrentTask({ action: "MODIFY", task: editedTask });
    setTaskArr(prev => {
      return prev.map((task) => {
        if (task.id === taskId) {
          return editedTask;
        }
        return task;
      })
    });
  }, []);

  /* Task DB 업데이트 */
  useEffect(() => {
    const { action, task } = currentTask;
    if (!action) return;

    accessTaskDB(action, task);
  }, [currentTask])

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

  const filterByTag = () => { };


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

  const ongoingTasks = useMemo(() => {
    const ongoing = taskArr.filter((task) => task.isCompleted === false);
    return mappingComponent(ongoing, Task, taskCallbacks)
  }, [taskArr]);
  const completedTasks = useMemo(() => {
    const completed = taskArr.filter((task) => task.isCompleted === true);
    return mappingComponent(completed, Task, taskCallbacks)
  }, [taskArr]);

  return (
    <div className="front">
      <main>
        <AddNewTask addTask={addTask} />
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