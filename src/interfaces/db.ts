export interface Identified {
  id: string
}

export interface TaskDB extends Identified {
  title: string;
  dueDate: string;
  isCompleted: boolean;
  text: string;
}

export interface TagDB extends Identified {
  tagText: string;
  assignedTask: Array<string>;
}

type dbType = "Task" | "Tag";
export type operationT = "ADD" | "MODIFY" | "DELETE";
export type actions = `${dbType}/${operationT}` | ""


