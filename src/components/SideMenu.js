import React from 'react';
import './SideMenu.css';
const { useState, useEffect, useRef, useCallback } = React;

const SideMenu = React.memo(function SideMenu({ status, title, dueDate, text, tags, onClick }) {

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
      <div className="tag-list"></div>
    </aside >
  )
});


export default SideMenu;