import { ChangeEvent } from "react";
import { taskDB, tagDB } from "./db";
import { editableField } from "./task";

interface callbacks {
  onClick: (arg: { status: boolean; id: string }) => void;
  onSelectTag: (e: ChangeEvent<HTMLSelectElement>, id: string) => void;
  onEditTask: (taskId: string, { field, newValue }: { field: editableField | null; newValue: string | boolean }) => void
}

export interface sidePanel extends taskDB {
  status: boolean,
  tagDB: Array<tagDB>,
  callbacks: callbacks
}
