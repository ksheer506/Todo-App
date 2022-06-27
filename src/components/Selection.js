import React from "react";

const Selection = ({ title, children, onSelect }) => {

  return (
    <div className='select-tag'>
      <span className='new-taskTags'>{title}</span>
      <select onChange={onSelect}>
        {children}
      </select>
    </div>
  );
}


export default Selection;