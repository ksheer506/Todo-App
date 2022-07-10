import React, { useEffect, useState } from "react";

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

  return <div className={`notification ${isFading ? "fade-out" : ""}`}>{text}</div>;
}
