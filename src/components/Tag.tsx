import React from "react";
import "./Tag.css";
const { useState } = React;

interface TagPropsType {
  tagText: string, 
  makeChk: boolean,
  callbacks?: any
}

function Tag(props: TagPropsType) {
  const [selected, setSelected] = useState(false);
  const { tagText, makeChk, callbacks } = props;
  const { onDelete, onFiltering } = callbacks || {};

  /* Tag 선택 토글 */
  const onTagSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(!!e.target.checked);
    onFiltering(e.target.checked, tagText);
  };

  return (
    <div className="tag-wrapper">
      <label className={`tags ${selected ? "selected" : ""}`}>
        {tagText}
        {makeChk && <input type="checkbox" onChange={onTagSelected} />}
      </label>
      <button className="delete-tag" onClick={() => onDelete(tagText)}>
        x
      </button>
    </div>
  );
}

function TagList({ children }: { children: React.ReactElement[] }) {
  return <div className="tag-list">{children}</div>;
}

export { Tag, TagList };
