export interface TaskDB {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  text: string;
}

export interface TagDB {
  id: string;
  tagText: string;
  assignedTask: Array<string>;
}

type dbType = "Task" | "Tag";
export type operationT = "ADD" | "MODIFY" | "DELETE";
export type actions = `${dbType}/${operationT}` | ""


