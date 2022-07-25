import { TagDB } from "../../interfaces/db";

export function tagReducer(
  state: Array<TagDB>,
  { type, payload }: { type: string; payload: any }
): Array<TagDB> {
  const { newTag, id, taskID } = payload;
  switch (type) {
    case "INIT":
      return [...payload];
    case "ADD":
      // payload: { newTag: "태그1 태그2" }
      const newTags =
        newTag.match(/[^#\s]\S{0,}[^\s,]/g)?.map((tagText: string) => ({
          tagText: tagText,
          id: tagText,
          assignedTask: [],
        })) || [];

      if (newTags.length < 1) {
        // TODO: 모달 등의 컴포넌트 이용하기
        alert("허용되지 않는 태그입니다.");
      }
      // TODO: 이미 존재하는 태그 걸러내기

      return [...state, ...newTags];
    case "DELETE":
      // payload: { id: "태그1" }
      return state.filter((tag) => tag.id !== payload.id);
    case "ADD_TASK_TAG":
      // payload: { taskID: "1367556", id: "태그1" }
      if (!id) return state;

      return state.map((tag) => {
        if (tag.id === id) {
          const editedTag = { ...tag, assignedTask: [...tag.assignedTask, taskID] };
          return editedTag;
        }
        return tag;
      });
    case "DELETE_TASK_TAG":
      if (!id) return state;

      return state.map((tag) => {
        if (tag.id === id) {
          const editedAT = tag.assignedTask.filter((task) => task !== taskID);
          return { ...tag, assignedTask: editedAT };
        }
        return tag;
      });
    default:
      return state;
  }
}
