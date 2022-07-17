import React from "react";
import { useEffect, useCallback, useState } from "react";

import { accessTaskDB, accessTagDB } from "./modules/db/access";
import { fetchAssignedTasks } from "./modules/db/fetching";

import { TaskDB, TagDB, Operations, Identified, CurrentWork } from "./interfaces/db";

import SectionPanel from "./components/SectionPanel";
import { TaskListContainer } from "./components/TaskList";
import { AddNewTask, AddNewTags } from "./components/AddNewItems";
import SideMenu from "./components/SidePanel";
import { TagList } from "./components/Tag";
import Nav from "./components/Nav";
import Header from "./components/Header";
import Toast from "./components/Toast";

import "./App.css";
import { fetchAllDB } from "./modules/db/initialLoad";
import { useObjectEditor } from "./custom-hooks";

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
  Component: (x: T & S) => React.ReactElement | null,
  extraProps: S
): React.ReactElement[] {
  return arr.map((props) => {
    const componentProps = { ...props, ...extraProps, key: props.id };

    return <Component {...componentProps} />;
  });
}
// TODO: 변경사항이 있는 객체를 저장해 IDB와 동기화할 수 있게 수정
function taskReducer(state: Array<TaskDB>, { type, payload }) {
  switch (type) {
    case "ADD":
      // payload: { title: "1", dueDate?: "2022-01-01" }
      if (!payload.title) {
        alert("할 일을 입력해주세요.");
        return;
      }
      const newTaskInst = new Todo(payload);

      return [...state, newTaskInst];
    case "DELETE":
      // payload: { taskID: "1367556" }
      return state.filter((task) => task.id !== payload.taskID);
    default:
      return state;
  }
}

function tagReducer(state: Array<TagDB>, { type, payload }) {
  const { newTags, taskID, tagID } = payload;
  switch (type) {
    case "ADD":
      // payload: { newTag: "태그1 태그2" }
      const newTags =
        payload.newTag.match(/[^#\s]\S{0,}[^\s,]/g)?.map((tagText: string) => ({
          tagText: tagText,
          id: tagText,
          assignedTask: [],
        })) || [];

      if (newTags.length < 1) {
        // TODO: 모달 등의 컴포넌트 이용하기
        alert("허용되지 않는 태그입니다.");
      }
      // TODO: 이미 존재하는 태그 걸러내기

      return [...state, ...newTags];
    case "DELETE":
      // payload: { tagID: "태그1" }
      return state.filter((tag) => tag.id !== payload.tagID);
    case "ADD_TASK_TAG":
      // payload: { taskID: "1367556", tagID: "태그1" }
      if (!tagID) return;

      return state.map((tag) => {
        if (tag.id === tagID) {
          const editedTag = { ...tag, assignedTask: [...tag.assignedTask, taskID] };
          return editedTag;
        }
        return tag;
      });
    case "DELETE_TASK_TAG":
      if (!tagID) return;

      return state.map((tag) => {
        if (tag.id === tagID) {
          const editedAT = tag.assignedTask.filter((task) => task !== taskID);
          return { ...tag, assignedTask: editedAT };
        }
        return tag;
      });
    default:
      return state;
  }
}

function App() {
  const [currentWork, setCurrentWork] = useState<CurrentWork>({ action: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [side, setSide] = useState<{ status: boolean; id: string }>({
    status: false,
    id: "",
  });
  const [tagArr, setTagArr, onEditTag, tagHistory] = useObjectEditor<TagDB>([], "tag");
  const [taskArr, setTaskArr, onEditTask, taskHistory] = useObjectEditor<TaskDB>([], "task");
  const [filtered, setFiltered] = useState<{ isOn: boolean; TaskId: Array<string> }>({
    isOn: false,
    TaskId: [],
  });

  /* DB 불러오기 */
  useEffect(() => {
    (async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });

      const [tags, tasks] = await fetchAllDB();

      setTaskArr(tasks);
      setTagArr(tags);
      setIsLoading(false);
    })();
  }, []);

  /* 할일 사이드 메뉴에서 보기 */
  const showToSide = useCallback((taskID: string) => {
    setSide({ status: true, id: taskID });
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

    setTaskArr((prev) => [...prev, newTaskInst]);
    setCurrentWork({ action: "task/ADD", task: newTaskInst });
  }, []);

  /* 3. 할일 삭제 */
  const deleteTask = useCallback(
    (taskID: string) => {
      const taskObj = findObj(taskArr, taskID);

      setTaskArr((prev) => {
        return prev.filter((task) => task.id !== taskID);
      });
      setCurrentWork({ action: "task/DELETE", task: taskObj });
    },
    [taskArr]
  );

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

    setTagArr((prev) => [...prev, ...newTags]);
    setCurrentWork({ action: "tag/ADD", tag: newTags });
  }, []);

  const deleteTag = (tagText: string) => {
    const tagObj = findObj(tagArr, tagText);

    setTagArr((prev) => {
      return prev.filter((tag) => tag.id !== tagText);
    });
    setCurrentWork({ action: "tag/DELETE", tag: [tagObj] });
  };

  /* 사이드 패널에서 태그 추가 */
  const selectTaskTag = (taskID: string, tagID: string) => {
    if (!tagID) return;

    const tagObj = findObj(tagArr, tagID);
    const editedTag = {
      ...tagObj,
      assignedTask: tagObj.assignedTask.concat(taskID),
    };

    setTagArr((prev) => {
      return prev.map((tag) => {
        if (tag.id === tagID) {
          return editedTag;
        }
        return tag;
      });
    });
    setCurrentWork({ action: "tag/MODIFY", tag: [editedTag] });
  };

  /* 사이드 패널에서 태그 삭제 */
  const deleteTaskTag = async (taskID: string, tagID: string) => {
    const [targetTag] = await fetchAssignedTasks([tagID]);
    const idx = targetTag.assignedTask.findIndex((task) => task === taskID);
    const editedTag = {
      ...targetTag,
      assignedTask: [
        ...targetTag.assignedTask.slice(0, idx),
        ...targetTag.assignedTask.slice(idx + 1),
      ],
    };

    setTagArr((prev) => {
      return prev.map((tag) => {
        if (tag.id === tagID) {
          return editedTag;
        }
        return tag;
      });
    });
    setCurrentWork({ action: "tag/MODIFY", tag: [editedTag] });
  };

  /* DB 업데이트 */
  useEffect(() => {
    const { action, task } = taskHistory;
    if (!action) return;

    accessTaskDB(action as Operations, task);
  }, [taskHistory]);

  useEffect(() => {
    const { action, tag } = tagHistory;
    if (!action) return;

    accessTagDB(action as Operations, tag);
  }, [tagHistory]);

  const taskCallbacks = {
    onTitleClick: showToSide,
    onDelete: deleteTask,
    onEditTask,
  };

  const sideCallbacks = {
    onClick: setSide,
    onSelectTag: selectTaskTag,
    onEditTask,
    onDeleteTag: deleteTaskTag,
  };

  const data = filtered.isOn
    ? taskArr.filter((task) => filtered.TaskId.includes(task.id))
    : taskArr;

  return (
    <>
      <Toast text="test" dismissTime={1000} />
      <Nav />
      <Header />
      <div
        id="background"
        className={side.status ? "mobile" : ""}
        onClick={() => setSide({ status: false, id: "" })}
      ></div>
      <main className={side ? "sideshow" : ""}>
        <AddNewTask addTask={addTask} />
        <AddNewTags addTags={addTags}>
          <TagList
            tagArr={tagArr}
            isLoading={isLoading}
            setFilteredTask={setFiltered}
            deleteTag={deleteTag}
          />
        </AddNewTags>
        <SectionPanel />
        <article className="todo_list">
          <TaskListContainer
            sections={[""]}
            taskArr={data}
            taskCallbacks={taskCallbacks}
            isLoading={isLoading}
          />
        </article>
      </main>
      <SideMenu {...sideContent} tagDB={tagArr} callbacks={sideCallbacks} />
    </>
  );
}

export default App;
