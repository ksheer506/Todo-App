import React from "react";
import { mappingComponent } from "../App";

import { TaskListContainerProps, TaskListSectionProps } from "../interfaces/task";
import Loading from "./Loading";
import { Task } from "./Task";

import "./TaskList.css";

const TaskListSection = React.memo(function ({
  sectionClass,
  isLoading,
  children,
}: TaskListSectionProps) {
  const sectionName = sectionClass === "ongoing" ? "진행중" : "완료";

  return (
    <section className={sectionClass}>
      <header>
        <h3>{sectionName}</h3>
      </header>
      <input
        type="checkbox"
        aria-label={`${sectionName} 목록 접기`}
        className="toggle-collapse"
      />
      <div className="toggle-icon"></div>
      {isLoading ? <Loading /> : <ul>{children}</ul>}
    </section>
  );
});



const TaskListContainer = ({ sections, taskArr, isLoading, taskCallbacks }: TaskListContainerProps) => {
  const ongoing = taskArr.filter((task) => task.isCompleted === false);
  const completed = taskArr.filter((task) => task.isCompleted === true);
  const defaultSection = [
    { name: "ongoing", children: ongoing },
    { name: "completed", children: completed },
  ];

  return (
    <article className="todo_list">
      {defaultSection.map((section) => (
        <TaskListSection sectionClass={section.name} isLoading={isLoading} key={section.name}>
          {mappingComponent(section.children, Task, taskCallbacks)}
        </TaskListSection>
      ))}
    </article>
  );
};

export { TaskListContainer, TaskListSection };
