import React from "react";
import { useEffect, useCallback, useMemo, useState } from "react";

import { accessTaskDB, accessTagDB } from "./modules/db/access";
import { FilterByTagsDB } from "./modules/db/fetching";

import { TaskDB, TagDB, operationT, Identified, CurrentWork } from "./interfaces/db";
import { EditedTask } from "./interfaces/task";

import { Task } from "./components/Task";
import SectionPanel from "./components/SectionPanel";
import { TaskListContainer, TaskListSection } from "./components/TaskList";
import { AddNewTask, AddNewTags } from "./components/AddNewItems";
import SideMenu from "./components/SideMenu";
import { Tag, TagList } from "./components/Tag";
import Nav from "./components/Nav";

import "./App.css";
import { loadIndexedDB } from "./modules/db/initialLoad";

class Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
  text: string;
  tags: Array<string>;

  constructor(object: Pick<TaskDB, "title" | "dueDate">) {
    this.id = `id_${Date.now()}`;
    this.title = object.title;
    this.isCompleted = false;
    this.dueDate = object.dueDate || "";
    this.text = "";
    this.tags = [];
  }
}

function findObj<T extends Identified>(data: Array<T>, id: string): T {
  return data.filter((obj) => obj.id === id)[0];
}

export function mappingComponent<T extends Identified, S>(
  arr: Array<T>,
  Component: React.FC<T & S>,
  extraProps: S
): React.ReactElement[] {
  return arr.map((props) => {
    const componentProps = { ...props, ...extraProps, key: props.id };

    return <Component {...componentProps} />;
  });
}

function App() {
  const [currentWork, setCurrentWork] = useState<CurrentWork>({ action: "" });
  const [side, setSide] = useState<{ status: boolean; id: string }>({
    status: false,
    id: "",
  });
  const [tagArr, setTagArr] = useState<Array<TagDB>>([]);
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);
  const [taskArr, setTaskArr] = useState<Array<TaskDB>>([]); 

  useEffect(() => {
    (async () => {
      const [tasks, tags] = await loadIndexedDB()
      setTaskArr(tasks);
      setTagArr(tags);
    })();
  }, []);

  /* 할일 사이드 메뉴에서 보기 */
  const showToSide = useCallback((taskId: string) => {
    setSide({ status: true, id: taskId });
  }, []);
  const sideContent = { ...side, ...taskArr.filter((task) => task.id === side.id)[0] };

  /* 1. 새 할일 추가 */
  const addTask = useCallback((task: Pick<TaskDB, "title" | "dueDate">) => {
    // TODO: Task 관련 이벤트 핸들러가 비슷비슷: useReducer로 하나로 통합?
    if (!task.title) {
      alert("할 일을 입력해주세요.");
      return;
    }

    const newTaskInst = new Todo(task);

    setCurrentWork({ action: "Task/ADD", task: newTaskInst });
    setTaskArr((prev) => [...prev, newTaskInst]);
  }, []);

  /* 할일 변경(dueDate, isCompleted, text) */
  const onEditTask = useCallback(
    (taskId: string, { field, newValue }: EditedTask) => {
      if (!field) return;

      const taskObj = findObj(taskArr, taskId);
      const editedTask = { ...taskObj, [field]: newValue };

      console.log(editedTask);
      setCurrentWork({ action: "Task/MODIFY", task: editedTask });
      setTaskArr((prev) => {
        return prev.map((task) => {
          if (task.id === taskId) {
            return editedTask;
          }
          return task;
        });
      });
    },
    [taskArr]
  );

  /* 3. 할일 삭제 */
  const deleteTask = useCallback(
    (taskId: string) => {
      const taskObj = findObj(taskArr, taskId);

      setCurrentWork({ action: "Task/DELETE", task: taskObj });
      setTaskArr((prev) => {
        return prev.filter((task) => task.id !== taskId);
      });
    },
    [taskArr]
  );

  /* DB 업데이트 */
  useEffect(() => {
    const { action, task, tag }: CurrentWork = currentWork;
    if (!action) return;

    const [db, operation] = action.match(/\w{1,10}/g) || ["", ""];

    if (task) {
      accessTaskDB(operation as operationT, task);
    }
    if (tag) {
      accessTagDB(operation as operationT, tag);
    }
  }, [currentWork]);

  const addTags = useCallback((newTag: string) => {
    // [{tagText: "태그1", id: "태그1", assignedTask: []}, { ... }, ...]
    const newTags =
      newTag.match(/[^#\s]\S{0,}[^\s,]/g)?.map((tagText: string) => ({
        tagText: tagText,
        id: tagText,
        assignedTask: [],
      })) || [];

    if (newTags.length < 1) {
      // TODO: 모달 등의 컴포넌트 이용하기
      alert("허용되지 않는 태그입니다.");
    }
    // TODO: 이미 존재하는 태그 걸러내기

    setCurrentWork({ action: "Tag/ADD", tag: newTags });
    setTagArr((prev) => [...prev, ...newTags]);
  }, []);

  const deleteTag = (tagText: string) => {
    const tagObj = findObj(tagArr, tagText);

    setCurrentWork({ action: "Tag/DELETE", tag: [tagObj] });
    setTagArr((prev) => {
      return prev.filter((tag) => tag.id !== tagText);
    });
  };

  const filterByTag = (isSelected: boolean, tagText: string) => {
    if (!isSelected) {
      setSelectedTags((prev) => {
        return prev.filter((el) => el !== tagText);
      });

      return;
    }
    setSelectedTags((prev) => [...prev, tagText]);
  };

  useEffect(() => {
    (async () => {
      if (selectedTags.length) {
        await FilterByTagsDB(selectedTags);
      }
    })();
  }, [selectedTags]);

  /* 사이드 패널에서 태그 추가 */
  const selectTaskTag = (e: React.ChangeEvent<HTMLSelectElement>, taskId: string) => {
    if (!e.target.value) return;

    const tagObj = findObj(tagArr, e.target.value);
    const editedTag = {
      ...tagObj,
      assignedTask: tagObj.assignedTask.concat(taskId),
    };

    setTagArr((prev) => {
      return prev.map((tag) => {
        if (tag.id === e.target.value) {
          return editedTag;
        }
        return tag;
      });
    });

    setCurrentWork({ action: "Tag/MODIFY", tag: [editedTag] });
  };

  const taskCallbacks = {
    onTitleClick: showToSide,
    onDelete: deleteTask,
    onEditTask,
  };

  const tagCallbacks = {
    onDelete: deleteTag,
    onFiltering: filterByTag,
  };

  const sideCallbacks = {
    onClick: setSide,
    onSelectTag: selectTaskTag,
    onEditTask,
  };


  const ongoing = taskArr.filter((task) => task.isCompleted === false);
  const completed = taskArr.filter((task) => task.isCompleted === true);
  const tags = mappingComponent(tagArr, Tag, { makeChk: true, callbacks: tagCallbacks });

  return (
    <>
      <Nav />
      <header>
        <h2 id="todo-title">할 일 목록</h2>
        <button id="edit-title" aria-label="앱 제목 변경"></button>
        <div className="toggle-dark">
          <p>다크 모드</p>
          <input type="checkbox" id="default" />
          <label className="switch" htmlFor="default" />
        </div>
      </header>
      <div
        id="background"
        className={side.status ? "mobile" : ""}
        onClick={() => setSide({ status: false, id: "" })}
      ></div>
      <main className={side ? "sideshow" : ""}>
        <AddNewTask addTask={addTask} />
        <AddNewTags addTags={addTags}>
          <TagList>{tags}</TagList>
        </AddNewTags>
        <SectionPanel />
        <article className="todo_list">
          <TaskListContainer sections={[""]} taskArr={taskArr} taskCallbacks={taskCallbacks} />
        </article>
      </main>
      <SideMenu {...sideContent} tagDB={tagArr} callbacks={sideCallbacks} />
    </>
  );
}

export default App;
