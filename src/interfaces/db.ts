export interface Identified {
  id: string
}

export interface TaskDB extends Identified {
  title: string,
  dueDate: string,
  isCompleted: boolean,
  text: string
}

export interface TagDB extends Identified {
  tagText: string,
  assignedTask: Array<string>
}

export interface StoreDB  {
  task: TaskDB,
  tagList: TagDB
};

export type StoreNames = keyof StoreDB

type DBType = "task" | "tag";
export type Operations = "ADD" | "MODIFY" | "DELETE";
export type actions = `${DBType}/${Operations}` | ""

export interface CurrentWork {
  action: actions;
  task?: TaskDB;
  tag?: Array<TagDB>;
}




