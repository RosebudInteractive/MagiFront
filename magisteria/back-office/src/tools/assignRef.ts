import type { ForwardedRef } from 'react';

export default function assignRef<T extends HTMLElement | null>(...refs: ForwardedRef<T>[]):
(instance: T | null) => void {
  return (ref) => {
    refs.forEach((someRef) => {
      if (!someRef) return;
      if (typeof someRef === 'function') {
        someRef(ref);
      } else {
        // eslint-disable-next-line no-param-reassign
        someRef.current = ref;
      }
    });
  };
}
