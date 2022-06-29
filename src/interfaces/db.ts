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

export type dbType = ""

export type operation = "ADD" | "MODIFY" | "DELETE";