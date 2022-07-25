import React, { useState, useEffect } from "react";

import { mappingComponent } from "../App";
import { TagListProps, TagProps } from "../interfaces/tag";
import { FilterByTagsDB } from "../modules/db/fetching";
import Loading from "./Loading";

import "./Tag.css";

function Tag({ tagText, makeChk, callbacks }: TagProps) {
  const [selected, setSelected] = useState(false);
  const { onDeleteTag, onFilter } = callbacks || {};

  /* Tag 선택 토글 */
  const onTagSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(!!e.target.checked);
    onFilter(e.target.checked, tagText);
  };

  return (
    <div className="tag-wrapper">
      <label className={`tags ${selected ? "selected" : ""}`}>
        {tagText}
        {makeChk && <input type="checkbox" onChange={onTagSelected} />}
      </label>
      <button className="delete-tag" onClick={() => onDeleteTag(tagText)}>
        x
      </button>
    </div>
  );
}

function TagList({ tagArr, isLoading, setFilteredTask, tagDispatch }: TagListProps) {
  const [selected, SetSelected] = useState<Array<string>>([]);

  const deleteTag = (id: string) => {
    tagDispatch({ type: "DELETE", payload: { id } });
  };

  const filterByTag = (isSelected: boolean, tagText: string) => {
    if (!isSelected) {
      SetSelected((prev) => {
        return prev.filter((el) => el !== tagText);
      });

      return;
    }
    SetSelected((prev) => [...prev, tagText]);
  };

  useEffect(() => {
    (async () => {
      if (selected.length) {
        const taskIDs = await FilterByTagsDB(selected);
        setFilteredTask({ isOn: true, TaskId: taskIDs });
      } else {
        setFilteredTask({ isOn: false, TaskId: [] });
      }
    })();
  }, [selected, tagArr]);

  const tagCallbacks = {
    onDeleteTag: deleteTag,
    onFilter: filterByTag,
  };

  return (
    <div className="tag-list">
      {isLoading ? (
        <Loading />
      ) : (
        mappingComponent(tagArr, Tag, { makeChk: true, callbacks: tagCallbacks })
      )}
    </div>
  );
}

export { Tag, TagList };
