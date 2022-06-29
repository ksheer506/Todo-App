import React from "react";
import { taskType } from "../interfaces/task";
import { sidePanel } from "../interfaces/sidePanel";
import { tagDB } from "../interfaces/db";
import "./SideMenu.css";

import Selection from "./Selection";
const { useState, useEffect, useRef, useCallback } = React;

const SideMenu = React.memo(function SideMenu({
  id,
  status,
  title,
  dueDate,
  text,
  tags,
  callbacks,
}: sidePanel) {
  const tagList = tags.map((el: tagDB) => (
    <option value={el.tagText} key={el.id}>
      {el.tagText}
    </option>
  ));
  const { onClick, onSelect } = callbacks;

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
          onSelect={(e: React.ChangeEvent<HTMLSelectElement>) => onSelect(e, id)}
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
