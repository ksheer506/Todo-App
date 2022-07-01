import { tagDB } from "./db";
import { taskType } from "./task";

export interface sidePanel extends taskType {
  status: boolean;
  tagDB: Array<tagDB>;
}
