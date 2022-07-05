import { ChangeEvent } from "react";
import { TaskDB, TagDB } from "./db";
import { EditedTask } from "./task";

interface Callbacks {
  onClick: (arg: { status: boolean; id: string }) => void;
  onSelectTag: (e: ChangeEvent<HTMLSelectElement>, id: string) => void;
  onEditTask: (taskId: string, { field, newValue }: EditedTask) => void;
}

export interface SidePanel extends TaskDB {
  status: boolean,
  tagDB: Array<TagDB>,
  callbacks: Callbacks
}
