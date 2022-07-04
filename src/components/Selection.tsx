import React from "react";

interface SelectionPropsType {
  title: string,
  children: React.ReactElement[],
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const Selection = ({ title, children, onSelect }: SelectionPropsType) => {

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