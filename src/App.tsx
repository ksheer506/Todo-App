import React from "react";
import { useEffect, useState } from "react";

import { TaskDB, TagDB, Operations, Identified } from "./interfaces/db";

import SectionPanel from "./components/SectionPanel";
import { TaskListContainer } from "./components/TaskList";
import { AddNewTask, AddNewTags } from "./components/AddNewItems";
import SideMenu from "./components/SidePanel";
import { TagList } from "./components/Tag";
import Nav from "./components/Nav";
import Header from "./components/Header";
import Toast from "./components/Toast";

import "./App.css";
import { accessDB } from "./modules/db/access";
import { fetchAllDB } from "./modules/db/initialLoad";
import { useDispatchHistory } from "./custom-hooks";
import { taskReducer } from "./features/reducers/taskReducer";
import { tagReducer } from "./features/reducers/tagReducer";
import { EditedTask } from "./interfaces/task";

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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [side, setSide] = useState<{ status: boolean; id: string }>({
    status: false,
    id: "",
  });
  const [tagArr, tagDispatch, tagHistory] = useDispatchHistory<Array<TagDB>>(tagReducer, []);
  const [taskArr, taskDispatch, taskHistory] = useDispatchHistory<Array<TaskDB>>(
    taskReducer,
    []
  );
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

      taskDispatch({ type: "INIT", payload: tasks });
      tagDispatch({ type: "INIT", payload: tags });
      setIsLoading(false);
    })();
  }, []);

  /* 할일 사이드 메뉴에서 보기 */
  const showToSide = (taskID: string) => {
    setSide({ status: true, id: taskID });
  };
  const sideContent = { ...side, ...taskArr.filter((task) => task.id === side.id)[0] };

  /* 1. 새 할일 추가 */
  const addTask = (task: Pick<TaskDB, "title" | "dueDate">) => {
    const { title, dueDate } = task;
    taskDispatch({ type: "ADD", payload: { title, dueDate } });
  };

  /* 3. 할일 삭제 */
  const deleteTask = (id: string) => {
    taskDispatch({ type: "DELETE", payload: { id } });
  };

  const onEditTask = (id: string, { field, newValue }: EditedTask) => {
    taskDispatch({ type: "EDIT", payload: { id, field, newValue } });
  };

  const addTags = (newTag: string) => {
    // [{tagText: "태그1", id: "태그1", assignedTask: []}, { ... }, ...]
    const id = newTag;
    tagDispatch({ type: "ADD", payload: { id, newTag } });
  };

  /* DB 업데이트 */
  useEffect(() => {
    if (!taskHistory?.item) return;

    const { action, id, item } = taskHistory;
    let currentItem: Identified = item;

    if (!currentItem) {
      currentItem = { id };
    }
    accessDB("task", action as Operations, [item]);
  }, [taskHistory]);

  useEffect(() => {
    if (!tagHistory?.item) return;

    const { action, id, item } = tagHistory;
    let currentItem: Identified = item;

    if (!currentItem) {
      currentItem = { id };
    }
    accessDB("tagList", action as Operations, [item]);
  }, [tagHistory]);

  const taskCallbacks = {
    onTitleClick: showToSide,
    onDelete: deleteTask,
    onEditTask,
  };

  const sideCallbacks = {
    onClick: setSide,
    taskDispatch,
    tagDispatch,
  };

  const data = filtered.isOn
    ? taskArr.filter((task) => filtered.TaskId.includes(task.id))
    : taskArr;

  return (
    <>
      {/* <Toast text="test" dismissTime={1000} /> */}
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
            tagDispatch={tagDispatch}
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
