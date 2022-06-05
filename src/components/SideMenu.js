import React from 'react';
import './SideMenu.css';
const { useState, useEffect, useRef, useCallback } = React;

const SideMenu = React.memo(function SideMenu({title, dueDate, text, tags}) {

  return (
    <aside>
      <h2>{title}</h2>
      <div className="dueDate">{dueDate}</div>
      <div className="text">{text}</div>
      <div className="tag-list"></div>
    </aside>
    );
});


export default SideMenu;