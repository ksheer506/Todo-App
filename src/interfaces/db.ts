export interface taskDB {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  tags: Array<string>;
  text: string;
}

export interface tagDB {
  id: string;
  tagText: string;
  assignedTask: Array<string>;
}

type dbType = "Task" | "Tag";
export type operationT = "ADD" | "MODIFY" | "DELETE";
export type actions = `${dbType}/${operationT}` | ""
