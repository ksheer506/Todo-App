import React from "react";
import { useEffect, useCallback, useMemo, useState } from "react";

import { accessTaskDB, accessTagDB } from "./modules/db/access";
import { fetchAssignedTasks } from "./modules/db/fetching";

import { TaskDB, TagDB, Operations, Identified, CurrentWork } from "./interfaces/db";
import { EditedTask } from "./interfaces/task";

import SectionPanel from "./components/SectionPanel";
import { TaskListContainer } from "./components/TaskList";
import { AddNewTask, AddNewTags } from "./components/AddNewItems";
import SideMenu from "./components/SidePanel";
import { TagList } from "./components/Tag";
import Nav from "./components/Nav";
import Header from "./components/Header";

import "./App.css";
import { fetchAllDB } from "./modules/db/initialLoad";
import Toast from "./components/Toast";

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
  const [isLoading, setIsLoading] = useState(true);
  const [side, setSide] = useState<{ status: boolean; id: string }>({
    status: false,
    id: "",
  });
  const [tagArr, setTagArr] = useState<Array<TagDB>>([]);
  const [taskArr, setTaskArr] = useState<Array<TaskDB>>([]);
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
    setCurrentWork({ action: "Task/ADD", task: newTaskInst });
  }, []);

  /* 2. 할일 변경(dueDate, isCompleted, text) */
  const onEditTask = useCallback(
    (taskID: string, { field, newValue }: EditedTask) => {
      if (!field) return;

      const taskObj = findObj(taskArr, taskID);
      const editedTask = { ...taskObj, [field]: newValue };

      setTaskArr((prev) => {
        return prev.map((task) => {
          if (task.id === taskID) {
            return editedTask;
          }
          return task;
        });
      });
      setCurrentWork({ action: "Task/MODIFY", task: editedTask });
    },
    [taskArr]
  );

  /* 3. 할일 삭제 */
  const deleteTask = useCallback(
    (taskID: string) => {
      const taskObj = findObj(taskArr, taskID);

      setTaskArr((prev) => {
        return prev.filter((task) => task.id !== taskID);
      });
      setCurrentWork({ action: "Task/DELETE", task: taskObj });
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
    setCurrentWork({ action: "Tag/ADD", tag: newTags });
  }, []);

  const deleteTag = (tagText: string) => {
    const tagObj = findObj(tagArr, tagText);

    setTagArr((prev) => {
      return prev.filter((tag) => tag.id !== tagText);
    });
    setCurrentWork({ action: "Tag/DELETE", tag: [tagObj] });
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
    setCurrentWork({ action: "Tag/MODIFY", tag: [editedTag] });
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
    setCurrentWork({ action: "Tag/MODIFY", tag: [editedTag] });
  };

  /* DB 업데이트 */
  useEffect(() => {
    const { action, task, tag }: CurrentWork = currentWork;
    if (!action) return;

    const [db, operation] = action.match(/\w{1,10}/g) || ["", ""];

    if (task) {
      accessTaskDB(operation as Operations, task);
    }
    if (tag) {
      accessTagDB(operation as Operations, tag);
    }
  }, [currentWork]);

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
