import { ChangeEvent, ReactElement } from "react";
import { TaskDB, TagDB } from "./db";
import { EditedTask } from "./task";

interface Callbacks {
  onClick: (actions: { status: boolean; id: string }) => void;
  taskDispatch: (actions: { type: string; payload: any }) => void;
  tagDispatch: (actions: { type: string; payload: any }) => void;
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