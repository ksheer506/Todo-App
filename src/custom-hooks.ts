import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import { Identified } from "./interfaces/db";
import { fetchAllData } from "./modules/db/fetching";

/* export function useIndexedDB<T>(storeName: string) {
  const [data, setData] = useState<Array<T>>([]);

  useEffect(() => {
    (async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
      const dbData = await fetchAllData(storeName);

      setData(dbData);
    })();
  }, []);
} */

type Reducer<T> = (state: T, action: ReducerAction) => T;
interface ReducerAction {
  type: string;
  payload: any;
}

export function useDispatchHistory<T extends Array<Identified>>(
  reducer: Reducer<T>,
  initialData: T
) {
  const { current } = useRef<{ action: string; id: string }>({
    action: "",
    id: "",
  });
  const [data, dispatchData] = useReducer(reducer, initialData);
  const [history, setHistory] = useState<{
    action: string;
    id: string;
    item: typeof initialData[0];
  }>();
  console.log(data);

  const mDipspatch = useCallback(({ type, payload }: ReducerAction) => {
    console.log("실행", type, payload);
    switch (type) {
      case "ADD":
        if (!payload.id) {
          payload.id = `${Date.now()}`;
        }
        current.action = "ADD";
        break;
      case "DELETE":
        current.action = "DELETE";
        break;
      case "INIT":
        break;
      default:
        current.action = "MODIFY";
    }
    current.id = payload.id;
    dispatchData({ type, payload });
  }, []);

  useEffect(() => {
    const currentItem = data.filter((el) => el.id === current.id)[0];

    setHistory({ action: current.action, id: current.id, item: currentItem });
  }, [data]);

  return [data, mDipspatch, history] as const;
}

 export function useLocalStorage<T>(key: string, initialValue?: T): [T, (x: T) => void] {
   const [data, setData] = useState<T>(() => {
     const storageData = JSON.parse(localStorage.getItem(key) || '""');

     return storageData || initialValue;
   });

   const setLocalStorage = (value: T) => {
     if (value) {
       localStorage.setItem(key, JSON.stringify(value));
       setData(value);
     }
   };

   return [data, setLocalStorage];
 }

export function useDarkMode(): [boolean, () => void] {
  const [mode, setMode] = useLocalStorage("darkMode", false);

  const setDarkMode = () => {
    setMode(!mode);
  };

  useEffect(() => {
    if (mode) {
      document.documentElement.setAttribute("dark-theme", `${mode}`);
    }
  }, [mode]);

  return [mode, setDarkMode];
}
