import React, { useEffect, useRef, useState } from "react";

import { SidePanel } from "../interfaces/sidePanel";
import { EditedTask } from "../interfaces/task";

import { Tag } from "./Tag";
import Selection from "./Selection";

import "./SideMenu.css";


const SideMenu = React.memo(function SideMenu({ id, status, title, dueDate, text, tagDB, callbacks }: SidePanel) {
  const { onClick, onSelectTag, onEditTask } = callbacks;
  const [onEdit, setOnEdit] = useState<EditedTask>({ field: null, newValue: "" });
  const editField = useRef(null);

  const tagList: React.ReactElement[] = tagDB.map((el) => (
      <option value={el.tagText} key={el.id}>
        {el.tagText}
      </option>
  ));

  /* 해당 Task가 가진 Tag */
  const taskTag = tagDB.reduce((acc: Array<string>, cur) => {
    const { tagText, assignedTask } = cur;
    if (assignedTask.includes(id)) acc.push(tagText);

    return acc;
  }, []);

  const onEditCompleted = () => {
    onEditTask(id, onEdit);
    setOnEdit({ ...onEdit, field: null });
  };

  useEffect(() => {
    if (id && onEdit.field === "text") {
      const textArea = editField.current! as HTMLTextAreaElement;

      textArea.focus();
      textArea.setSelectionRange(text.length, text.length);
    }
  }, [onEdit.field]);

  return (
    <aside className={status ? "sideshow" : ""}>
      <div>
        <button
          className="close"
          aria-label="사이드 패널 닫기"
          onClick={() => {
            onClick({ status: false, id: "" });
          }}
        >
          x
        </button>
      </div>
      <h2>{title}</h2>

      <div className="dueDate">{dueDate}</div>
      {id && onEdit.field ? (
        <div className="text" onBlur={onEditCompleted}>
          <textarea
            ref={editField}
            value={onEdit.newValue || text}
            onChange={(e) => setOnEdit({ ...onEdit, newValue: e.target.value })}
          />
        </div>
      ) : (
        <div className="text" onClick={() => setOnEdit({ ...onEdit, field: "text" })}>
          {text}
        </div>
      )}

      {title ? (
        <Selection title="태그 추가" onSelect={(e: React.ChangeEvent<HTMLSelectElement>) => onSelectTag(e, id)}>
          <option value=""></option>
          <>{tagList}</>
        </Selection>
      ) : null}
      <div className="tag-list">
        {taskTag.map((tag) => (
          <Tag tagText={tag} makeChk={false} key={tag} />
        ))}
      </div>
    </aside>
  );
});

export default SideMenu;
