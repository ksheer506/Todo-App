import React from "react";
import { TaskDB } from "../interfaces/db";
import "./AddNewItems.css";
const { useState } = React;

type taskInput = "title" | "dueDate";

interface addNewTaskProps {
  addTask: (arg: Pick<TaskDB, "title" | "dueDate">) => void;
}

interface addNewTagProps {
  addTags: (arg: string) => void;
  children: JSX.Element;
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

  const onEnterPressed = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onCreate();
    }
  };

  return (
    <div id="add-task">
      <input
        type="text"
        placeholder="할 일을 입력해주세요."
        aria-label="새 할일 제목 입력"
        value={newTask.title}
        onKeyUp={onEnterPressed}
        onChange={(e) => onEdit(e, "title")}
      />
      <input
        type="date"
        aria-label="새 할일 만료일 입력"
        onChange={(e) => onEdit(e, "dueDate")}
      />
      <input type="button" value="추가하기" onClick={onCreate} />
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
  const onEnterPressed = (e: React.KeyboardEvent) => {
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
          onKeyUp={onEnterPressed}
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
