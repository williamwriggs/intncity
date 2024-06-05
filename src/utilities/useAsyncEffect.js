import { useEffect } from 'react';

export default function useAsyncEffect(f, ...args) {
  return useEffect(() => {
    const inner = async () => {
      await f();
    }
    inner();
  }, ...args);
}
