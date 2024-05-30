import { useEffect, useState } from "react";

const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
      try {
        return JSON.parse(storedValue) as T;
      } catch (error) {
        console.error('Error parsing stored value', error);
        return initialValue;
      }
    } else {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;

// export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
//   const [value, setValue] = useState<T>(() => {
//     const storedValue = localStorage.getItem(key)
//     return storedValue !== null ? JSON.parse(storedValue) : initialValue;
//   })
//
//   useEffect(() => {
//     localStorage.setItem(key, JSON.stringify(value))
//   }, [value, key])
//
//   return [value, setValue];
// }