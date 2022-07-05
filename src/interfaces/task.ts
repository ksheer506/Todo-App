import React, { ChangeEvent } from "react";
import { TaskDB } from "./db";



export interface TaskType extends TaskDB {
  callbacks?: object; // FIXME:
}

export type DatePickerType = Pick<TaskType, "id" | "dueDate"> & {
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
