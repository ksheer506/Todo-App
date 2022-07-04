import React from "react";
import { taskDB } from "../interfaces/db";
import "./AddNewItems.css";
const { useState } = React;

type taskInput = "title" | "dueDate";

interface addNewTaskProps {
  addTask: (arg: Pick<taskDB, "title" | "dueDate">) => void
}

interface addNewTagProps {
  addTags: (arg: string) => void,
  children: JSX.Element
}

const AddNewTask = React.memo(function ({ addTask }: addNewTaskProps) {
  const [newTask, setNewTask] = useState({ title: "", dueDate: "" });

  const onEdit = (e: React.ChangeEvent<HTMLInputElement>, state: taskInput) => {
    setNewTask({ ...newTask, [state]: e.target.value });
  };
  const onCreate = () => {
    setNewTask({ title: "", dueDate: "" });
    addTask(newTask);
  };

  return (
    <div>
      <header>
        <h2 id="todo-title">할 일 목록</h2>
        <div id="edit-title"></div>
        <div className="toggle-dark">
          <p>다크 모드</p>
          <input type="checkbox" id="default" />
          <label className="switch" htmlFor="default" />
        </div>
      </header>
      <div id="add-task">
        <input
          type="text"
          placeholder="할 일을 입력해주세요."
          value={newTask.title}
          onChange={(e) => onEdit(e, "title")}
        />
        <input type="date" onChange={(e) => onEdit(e, "dueDate")} />
        <input type="button" value="추가하기" onClick={onCreate} />
      </div>
    </div>
  );
});

const AddNewTags = React.memo(function (props: addNewTagProps) {
  const [newTag, setNewTag] = useState<string>("");
  const { addTags, children } = props;

  const onNewTag = () => {
    addTags(newTag);
    setNewTag("");
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onNewTag();
    }
  };

  return (
    <div className="tag-box">
      <div className="tag-conf">
        <p>태그</p>
        <input
          type="text"
          id="createTag"
          placeholder="ex. 태그1 태그2"
          value={newTag}
          onKeyUp={onKeyUp}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <input type="button" id="addTag" value="태그 추가" onClick={onNewTag} />
        <input type="button" id="deleteTag" value="태그 삭제" />
      </div>
      {children}
    </div>
  );
});

export { AddNewTask, AddNewTags };
