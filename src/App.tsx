import React from "react";
import { useEffect, useCallback, useMemo, useState } from "react";
import { accessTaskDB, accessTagDB } from "./modules/db/access";
import { FilterByTagsDB } from "./modules/db/fetching";

import { TaskDB, TagDB, operationT, actions } from "./interfaces/db";
import { EditedTask } from "./interfaces/task";

import "./App.css";
import { TaskListSection, Task } from "./components/Task";
import { AddNewTask, AddNewTags } from "./components/AddNewItems";
import SideMenu from "./components/SideMenu";
import { Tag, TagList } from "./components/Tag";

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

interface currentWork {
  action: actions;
  task?: TaskDB;
  tag?: Array<TagDB>;
}

function findObj<T>(data: Array<T>, id: string) {
  return data.filter((obj) => obj.id === id)[0];
}

function mappingComponent<T>(
  arr: Array<T>,
  Component: React.FC<T>,
  extraProps: { [x: string]: unknown }
) {
  return arr.map((props) => <Component {...props} {...extraProps} key={props.id} />);
}

function App({ tasks, tagList }: { tasks: Array<TaskDB>; tagList: Array<TagDB> }) {
  const [currentWork, setCurrentWork] = useState<currentWork>({ action: "" });
  const [side, setSide] = useState<{ status: boolean; id: string }>({
    status: false,
    id: "",
  });
  const [tagArr, setTagArr] = useState(tagList);
  const [selectedTags, setSelectedTags] = useState([]);
  const [taskArr, setTaskArr] = useState(tasks); // TODO:

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
    const { action, task, tag }: currentWork = currentWork;
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

  /*   const filterByTag = async (selection) => {
    const { isSelected, tag } = selection;

    if (!isSelected) {
      setSelectedTags((prev) => {
        return prev.filter((el) => el !== tag);
      });
    }
    setSelectedTags((prev) => [...prev, tag]);
    console.log(selectedTags);
  }; */

  useEffect(() => {
    if (selectedTags.length) {
      console.log(FilterByTagsDB(selectedTags));
    }
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
    /* onFiltering: filterByTag, */
  };

  const sideCallbacks = {
    onClick: setSide,
    onSelectTag: selectTaskTag,
    onEditTask,
  };

  const ongoingTasks = useMemo(() => {
    const ongoing = taskArr.filter((task) => task.isCompleted === false);
    return mappingComponent(ongoing, Task, taskCallbacks);
  }, [taskArr]);
  const completedTasks = useMemo(() => {
    const completed = taskArr.filter((task) => task.isCompleted === true);
    return mappingComponent(completed, Task, taskCallbacks);
  }, [taskArr]);

  return (
    <>
      <div
        id="background"
        className={side.status ? "mobile" : ""}
        onClick={() => setSide({ status: false, id: "" })}
      ></div>
      <main className={side ? "sideshow" : ""}>
        <AddNewTask addTask={addTask} />
        <AddNewTags addTags={addTags}>
          <TagList callbacks={tagCallbacks}>
            {mappingComponent(tagArr, Tag, {
              makeChk: true,
              callbacks: tagCallbacks,
            })}
          </TagList>
        </AddNewTags>
        <article className="todo_list">
          <TaskListSection sectionClass="ongoing">{ongoingTasks}</TaskListSection>
          <TaskListSection sectionClass="completed">{completedTasks}</TaskListSection>
        </article>
      </main>
      <SideMenu {...sideContent} tagDB={tagArr} callbacks={sideCallbacks} />
    </>
  );
}

export default App;
