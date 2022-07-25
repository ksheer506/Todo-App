import { TaskDB } from "../../interfaces/db";

class Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
  text: string;
  tags: Array<string>;

  constructor(object: Pick<TaskDB, "title" | "dueDate" | "id">) {
    this.id = object.id || `${Date.now()}`;
    this.title = object.title;
    this.isCompleted = false;
    this.dueDate = object.dueDate || "";
    this.text = "";
    this.tags = [];
  }
}

export function taskReducer(
  state: Array<TaskDB>,
  { type, payload }: { type: string; payload: any }
): Array<TaskDB> {
  switch (type) {
    case "INIT":
      return [...payload];
    case "ADD":
      // payload: { title: "1", dueDate?: "2022-01-01" }
      if (!payload.title) {
        alert("할 일을 입력해주세요.");
        return state;
      }
      const newTaskInst = new Todo(payload);

      return [...state, newTaskInst];
    case "DELETE":
      // payload: { id: "1367556" }
      return state.filter((task) => task.id !== payload.id);
    case "EDIT":
      // payload: { id: "1367556", field: "", newValue:  }
      const { id, field, newValue } = payload;
      const current = state.filter((el) => el.id === id)[0];
      const modified = { ...current, [field]: newValue };

      return state.map((el) => {
        if (el.id === id) {
          return modified;
        }
        return el;
      });
    default:
      return state;
  }
}
