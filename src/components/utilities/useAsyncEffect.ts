import { useEffect } from 'react';

export default function useAsyncEffect(f: () => Promise<void>, ...args: any[]) {
  return useEffect(() => {
    const inner = async () => {
      await f();
    }
    inner();
  }, ...args);
}
