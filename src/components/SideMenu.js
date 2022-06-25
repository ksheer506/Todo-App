import React from 'react';
import './SideMenu.css';

import Selection from './Selection';
const { useState, useEffect, useRef, useCallback } = React;

const SideMenu = React.memo(function SideMenu({ id, status, title, dueDate, text, tags, callbacks }) {
  const tagList = tags.map((el) => <option value={el.tagText} key={el.id}>{el.tagText}</option>)
  const { onClick, onSelect } = callbacks;

  return (
    <aside className={status ? "sideshow" : ""} >
      <div>
        <span
          className='close'
          onClick={() => { onClick(prev => ({ ...prev, status: false })) }}
        >
          x
        </span>
      </div>
      <h2>{title}</h2>

      <div className="dueDate">{dueDate}</div>
      <div className="text">{text}</div>
      {
        title ?
          (<Selection title="태그 추가" onSelect={(e) => onSelect(e, id)}>
            <option vlaue=""></option>
            {tagList}
          </Selection>)
          : null
      }
      <div className="tag-list"></div>
    </aside >
  )
});


export default SideMenu;