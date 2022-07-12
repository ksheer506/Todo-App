import { TagDB } from "./db";

export interface TagProps {
  tagText: string;
  makeChk: boolean;
  callbacks?: any;
}

export interface TagListProps {
  tagArr: Array<TagDB>;
  isLoading: boolean;
  setFilteredTask: (x: { isOn: boolean; TaskId: Array<string> }) => void;
  deleteTag: (TaskID: string, TagID: string) => void;
}
