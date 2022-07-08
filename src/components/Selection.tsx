import React from "react";

import { SelectionPropsType } from "../interfaces/sidePanel";


const Selection = ({ title, children, onSelect }: SelectionPropsType) => {

  return (
    <label className='select-tag'>
      <span className='new-taskTags'>{title}</span>
      <select onChange={onSelect}>
        {children}
      </select>
    </label>
  );
}


export default Selection;