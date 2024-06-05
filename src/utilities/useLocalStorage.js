"use client"
import { useState, useEffect } from "react";

function getStorageValue(key, defaultValue) {
  // getting stored value
  if(typeof localStorage !== "undefined" && window.localStorage) {
    const saved = localStorage.getItem(key);
    let initial = defaultValue;
    if (saved && saved != "undefined") {
      initial = JSON.parse(saved);
    }
    return initial;
  }

  return defaultValue;
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    if(typeof localStorage !== "undefined" && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
};