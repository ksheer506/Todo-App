export interface TaskType {
  id: string;
  dueDate: string;
}

export interface datePickerT extends TaskType {
  onChange: Function;
}