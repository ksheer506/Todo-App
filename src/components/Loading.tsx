import React from "react";
import styled from "styled-components";

const Dot = styled.span`
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 20px;
  background-color: white;
  animation: pop 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  @keyframes pop {
    0% {
      top: 0%;
      background-color: #42a6f8;
    }
    25% {
      top: -7%;
    }
    50% {
      top: 0%;
      background-color: #edf056;
    }
    75% {
      top: 7%;
      background-color: #f88461;
    }
    100% {
      top: 0%;
      background-color: #42a6f8;
    }
  }
`;

const StyledLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 5px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0);

  & span:nth-child(2) {
    animation-delay: 300ms;
  }
  & span:nth-child(3) {
    animation-delay: 600ms;
  }
`;

const Loading = () => {
  return (
    <StyledLoading>
      <Dot />
      <Dot />
      <Dot />
    </StyledLoading>
  );
};

export default Loading;
