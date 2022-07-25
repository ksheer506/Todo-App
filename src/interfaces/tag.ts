import { TagCallback } from "./callbacks";
import { TagDB } from "./db";

interface OnFilterTag {
  onFilter: (isSelected: boolean, tagText: string) => void;
} 

export interface TagProps {
  tagText: string;
  makeChk: boolean;
  callbacks: TagCallback & OnFilterTag;
}

export interface TagListProps {
  tagArr: Array<TagDB>;
  isLoading: boolean;
  setFilteredTask: (actions: { isOn: boolean; TaskId: Array<string> }) => void;
  tagDispatch: (actions: { type: string; payload: any }) => void;
}
