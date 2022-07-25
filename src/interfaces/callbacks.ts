import { EditedTask } from "./task";

export type OnlyIDParams = (...args: Array<string>) => void;

export interface taskCallbacks {
  onTitleClick: (taskID: string) => void,
  onDelete: (taskID: string) => void,
  onEditTask: (taskID: string, { field, newValue }: EditedTask) => void,
};

export interface sideCallbacks {
  onClick: (arg: { status: boolean; id: string }) => void,
  onSelectTag: (taskID: string, tagID: string) => void,
  onEditTask: (taskID: string, { field, newValue }: EditedTask) => void,
  onDeleteTag: (taskID: string, tagID: string) => void,
};

export interface TagCallback {
  onDeleteTag: (tagText: string) => void;
}