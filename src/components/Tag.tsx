import React from 'react';
import "./Tag.css"
const { useState, useEffect, useRef, useCallback } = React;



function Tag(props) {
  const [selected, setSelected] = useState(false);
  const { tagText, makeChk, callbacks } = props;
  const { onDelete, onFiltering } = callbacks;

  /* Tag 선택 토글 */
  const onTagSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(true);
      
    } else {
      setSelected(false);
    }
    onFiltering({isSelected: e.target.checked, tag: tagText})
  };

  return (
    <label className={`tags ${selected ? "selected" : ""}`}>
      {tagText}
      {makeChk && <input type="checkbox" onChange={onTagSelected} />}
    </label>  // 할일 필터링 용 체크박스
  );
};

function TagList({ children }: {children: JSX.Element}) {

  return (
    <div className="tag-list">
      {children}
    </div>
  )

}

export { Tag, TagList };