import React, { ChangeEvent } from "react";
import { taskCallbacks } from "./callbacks";
import { TaskDB } from "./db";

export interface TaskListContainerProps {
  sections: Array<string>;
  isLoading: boolean;
  taskArr: Array<TaskDB>;
  taskCallbacks: taskCallbacks;
}

export interface TaskListSectionProps {
  sectionClass: string;
  isLoading: boolean;
  children?: React.ReactNode;
}


export type TaskProps = TaskDB & taskCallbacks;

type EditableField = "title" | "dueDate" | "isCompleted" | "text";

export interface EditedTask {
  field: EditableField | null,
  newValue: string | boolean
}

export type DatePicker = Pick<TaskDB, "id" | "dueDate"> & {
  onChange: (e: ChangeEvent<HTMLInputElement>, id: string) => void;
};