import { taskDB, tagDB } from "./db";
import { taskType } from "./task";

export interface sidePanel extends taskDB {
  status: boolean;
  tagDB: Array<tagDB>;
}
