import React from "react";
import styled from "styled-components";

const Buttons = styled.button`
  border: 0px;
  height: 40px;

  &:hover {
    background-color: #f06363;
  }
`

const SectionPanel = () => {

  const onClick = (e: React.MouseEvent) => {
    
  }

  return (
    <div>
      <Buttons onClick={onClick}>전체</Buttons>
      <Buttons onClick={onClick}>만료일별</Buttons>
    </div>
  );
}

export default SectionPanel;