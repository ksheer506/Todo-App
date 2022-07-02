import React from "react";

import { sidePanel } from "../interfaces/sidePanel";
import "./SideMenu.css";

import Selection from "./Selection";

const SideMenu = React.memo(function SideMenu({
  id,
  status,
  title,
  dueDate,
  text,
  tagDB,
  callbacks,
}: sidePanel) {
  const { onClick, onSelect } = callbacks;

  const tagList = tagDB.map((el) => (
    <option value={el.tagText} key={el.id}>
      {el.tagText}
    </option>
  ));
  

  return (
    <aside className={status ? "sideshow" : ""}>
      <div>
        <span
          className="close"
          onClick={() => {
            onClick((prev) => ({ ...prev, status: false }));
          }}
        >
          x
        </span>
      </div>
      <h2>{title}</h2>

      <div className="dueDate">{dueDate}</div>
      <div className="text">{text}</div>
      {title ? (
        <Selection
          title="태그 추가"
          onSelect={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onSelect(e, id)
          }
        >
          <option value=""></option>
          {tagList}
        </Selection>
      ) : null}
      <div className="tag-list"></div>
    </aside>
  );
});

export default SideMenu;
