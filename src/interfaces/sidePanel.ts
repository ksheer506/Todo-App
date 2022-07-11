import { ChangeEvent, ReactElement } from "react";
import { TaskDB, TagDB } from "./db";
import { EditedTask } from "./task";

interface Callbacks {
  onClick: (arg: { status: boolean; id: string }) => void;
  onSelectTag: (taskID: string, tagID: string) => void;
  onEditTask: (taskID: string, { field, newValue }: EditedTask) => void;
  onDeleteTag: (taskID: string, tagID: string) => void;
}

export interface SidePanel extends TaskDB {
  status: boolean,
  tagDB: Array<TagDB>,
  callbacks: Callbacks
}

export interface SelectionPropsType {
  title: string;
  children: ReactElement[];
  onSelect: (e: ChangeEvent<HTMLSelectElement>) => void;
}