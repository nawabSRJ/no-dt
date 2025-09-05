import { useEffect, useMemo, useState } from 'react';
import { NoDT, GuardOptions } from '../src';

export const useNoDT = (options?: GuardOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const guard = useMemo(() => new NoDT({
    ...options,
    onStatusChange: (open) => {
      setIsOpen(open);
      options?.onStatusChange?.(open);
    }
  }), []);

  useEffect(() => {
    guard.start();
    return () => guard.stop();
  }, [guard]);

  return { isOpen, guard };
};

export { NoDT } from '../src';
export type { GuardOptions, DetectionEvent, GuardState } from '../src/types';