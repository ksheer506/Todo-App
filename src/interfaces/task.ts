import { taskDB } from "./db";

export interface taskType extends taskDB {
  callbacks?: object; // FIXME:
}

export interface datePickerT extends taskType {
  onChange: Function;
}