import React, { useEffect, useState } from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  position: absolute;
  padding: 8px;
  z-index: 3;
  top: 40px;
  right: 20px;
  border-radius: 5px;
  box-shadow: var(--shadow);
  background-color: #9b9bf8;
  opacity: 1;
  animation: showing 0.6s;
  transition: 0.6s all;

  &.fade-out {
    opacity: 0;
    transition: 0.3s all;
  }

  @keyframes showing {
    from {
      top: 0px;
    }
    to {
      top: 40px;
    }
  }
`;

interface Toast {
  text: string;
  dismissTime: number;
  unmountToast: () => void;
}

export default function Toast({ text, dismissTime, unmountToast }: Toast) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const offsetTime = 500;

    (async () => {
      await new Promise((resolve: (x: void) => void) => {
        setTimeout(() => {
          if (mounted) {
            setIsFading(true);
            resolve();
          }
        }, dismissTime);
      });

      setTimeout(unmountToast, offsetTime);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StyledDiv className={`notification ${isFading ? "fade-out" : ""}`}>{text}</StyledDiv>
  );
}
