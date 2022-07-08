import React, { ChangeEvent } from "react";
import { TaskDB } from "./db";

export interface TaskPropsType extends TaskDB {
  onTitleClick: (arg0: string) => void;
  onEditTask: (arg0: string, arg1: EditedTask) => void;
  onDelete: (arg0: string) => void;
}

export type DatePickerType = Pick<TaskDB, "id" | "dueDate"> & {
  onChange: (e: ChangeEvent<HTMLInputElement>, id: string) => void;
};

export interface TaskList {
  sectionClass: "ongoing" | "completed";
  children: React.ReactNode;
}

type editableField = "title" | "dueDate" | "isCompleted" | "text";

export interface EditedTask {
  field: editableField | null;
  newValue: string | boolean;
}
