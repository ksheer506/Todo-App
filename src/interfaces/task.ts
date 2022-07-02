import React from "react";
import { taskDB } from "./db";

export interface taskType extends taskDB {
  callbacks?: object; // FIXME:
}

export type datePickerT = Pick<taskType, "id" | "dueDate"> & {
  onChange: (e: React.ChangeEvent, id: string) => void;
};

export interface taskList {
  sectionClass: "ongoing" | "completed";
  children: React.ReactNode;
}