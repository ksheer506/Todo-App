import React, { ChangeEvent } from "react";
import { taskDB } from "./db";

export type editableField = "title" | "dueDate" | "isCompleted" | "text";

export interface taskType extends taskDB {
  callbacks?: object; // FIXME:
}

export type datePickerT = Pick<taskType, "id" | "dueDate"> & {
  onChange: (e: ChangeEvent<HTMLInputElement>, id: string) => void
};

export interface taskList {
  sectionClass: "ongoing" | "completed";
  children: React.ReactNode;
}

