import React from "react";
import { useEffect, useCallback, useMemo, useState } from "react";
import { accessTaskDB, accessTagDB } from "./modules/db/access";
import { FilterByTagsDB } from "./modules/db/fetching";

import { taskType } from "./interfaces/task";
import { taskDB, tagDB } from "./interfaces/db";
import { sidePanel } from "./interfaces/sidePanel";

import "./App.css";
import { TaskListSection, Task } from "./components/Task";
import { AddNewTask, AddNewTags } from "./components/AddNewItems";
import SideMenu from "./components/SideMenu";
import { Tag, TagList } from "./components/Tag";
import { queryByPlaceholderText } from "@testing-library/react";

class Todo implements taskType {
  constructor(object: taskType) {
    this.id = object.id || `id_${Date.now()}`;
    this.title = object.title;
    this.isCompleted = object.isCompleted || false;
    this.dueDate = object.dueDate || "";
    this.text = object.text || "";
    this.tags = object.tags || [];
  }
}

interface objects {}

interface currentWork {
  action: string;
  task?: taskDB;
  tag?: Array<tagDB>;
}

function findObj(data, id: string) {
  return data.filter((taskObj) => taskObj.id === id)[0];
}

function mappingComponent(
  arr: Array<{ id: string; [x: string]: any }>,
  Component: React.FC,
  extraProps: { [x: string]: any }
) {
  return arr.map((props) => (
    <Component {...props} {...extraProps} key={props.id} />
  ));
}

function App({
  tasks,
  tagList,
}: {
  tasks: Array<taskDB>;
  tagList: Array<tagDB>;
}) {
  const [currentWork, setCurrentWork] = useState<currentWork>({ action: "" });
  const [side, setSide] = useState<{ status: boolean }>({ status: false });
  const [tagArr, setTagArr] = useState(tagList);
  const [selectedTags, setSelectedTags] = useState([]);
  const [taskArr, setTaskArr] = useState(tasks); // TODO:

  /* 할일 사이드 메뉴에서 보기 */
  const showToSide = useCallback((props: taskDB) => {
    setSide({ status: true, ...props });
  }, []);

  /* 1. 새 할일 추가 */
  const addTask = useCallback((task) => {
    // TODO: Task 관련 이벤트 핸들러가 비슷비슷: useReducer로 하나로 통합?
    if (!task.title) {
      alert("할 일을 입력해주세요.");
      return;
    }

    const newTaskInst = new Todo(task);

    setCurrentWork({ action: "Task/ADD", task: newTaskInst });
    setTaskArr((prev) => [...prev, newTaskInst]);
  }, []);

  /* 2. 할일 완료/미완료 여부 변경 */
  const toggleCompletion = useCallback(
    (taskId: string) => {
      const taskObj = findObj(taskArr, taskId);
      const editedTask = { ...taskObj, isCompleted: !taskObj.isCompleted };

      setCurrentWork({ action: "Task/MODIFY", task: editedTask }); // 어따 쓰나?
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

  /* 4. 할일 만료일 변경 */
  const changeDueDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
      const taskObj = findObj(taskArr, taskId);
      const editedTask = { ...taskObj, dueDate: e.target.value };

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

  /* DB 업데이트 */
  useEffect(() => {
    const { action, task, tag }: currentWork = currentWork;
    if (!action) return;

    const [db, operation] = action.match(/\w{1,10}/g);

    if (task) {
      accessTaskDB(operation, task);
    }
    if (tag) {
      accessTagDB(operation, tag);
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

      if (newTags.length < 1) {  // TODO: 모달 등의 컴포넌트 이용하기
        alert("허용되지 않는 태그입니다.")
      }

    setCurrentWork({ action: "Tag/ADD", tag: newTags });
    setTagArr((prev) => [...prev, ...newTags]);
  }, []);

  const deleteTag = (tagText: string) => {
    const tagObj = findObj(tagArr, tagText);

    accessTagDB("DELETE", tagObj);
  };

  const filterByTag = async (selection) => {
    const { isSelected, tag } = selection;

    if (!isSelected) {
      setSelectedTags((prev) => {
        return prev.filter((el) => el !== tag);
      });
    }
    setSelectedTags((prev) => [...prev, tag]);
    console.log(selectedTags);
  };

  useEffect(() => {
    if (selectedTags.length) {
      console.log(FilterByTagsDB(selectedTags));
    }
  }, [selectedTags]);

  /* 사이드 패널에서 태그 추가 */
  const selectTaskTag = (e, taskId: string) => {
    const taskObj = findObj(taskArr, taskId);
    const tagObj = findObj(tagArr, e.target.value);
    const { tags } = taskObj;
    const editedTask = { ...taskObj, tags: tags.concat(e.target.value) };
    const editedTag = {
      ...tagObj,
      assignedTask: tagObj.assignedTask.concat(e.target.value),
    };

    setTaskArr((prev) => {
      return prev.map((task) => {
        if (task.id === taskId) {
          return editedTask;
        }
        return task;
      });
    });
    setTagArr((prev) => {
      return prev.map((tag) => {
        if (tag.id === e.target.value) {
          return editedTag;
        }
        return tag;
      });
    });

    setCurrentWork({
      action: "Task/MODIFY",
      task: editedTask,
      tag: [editedTag],
    });
  };

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

  const sideCallbacks = {
    onClick: setSide,
    onSelect: selectTaskTag,
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
      <div id="background" className={side.status ? "mobile" : ""}></div>
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
          <TaskListSection sectionClass="ongoing">
            {ongoingTasks}
          </TaskListSection>
          <TaskListSection sectionClass="completed">
            {completedTasks}
          </TaskListSection>
        </article>
      </main>
      <SideMenu {...side} tags={tagArr} callbacks={sideCallbacks} />
    </>
  );
}

export default App;
