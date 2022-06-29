export interface taskType {
  id: string,
  title: string,
  dueDate: string,
  text: string,
  tags: Array<string>,
  callbacks?: object  // FIXME:
}

export interface datePickerT extends taskType {
  onChange: Function;
}