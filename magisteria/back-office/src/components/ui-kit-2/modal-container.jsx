import React, { forwardRef, useRef } from 'react';
import styled from 'styled-components';
import assignRef from '#src/tools/assignRef';
const Container = styled.div `
  position: fixed;
  background-color: rgba(25, 25, 25, 0.35);
  z-index: ${({ zIndex }) => zIndex || 1};
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;
export const ModalContainer = forwardRef(({ renderContent, parentRef, ...props }, ref) => {
    const innerRef = useRef(null);
    const zIndex = parentRef && parentRef.current
        ? window.getComputedStyle(parentRef.current).zIndex + 1 : '1';
    return (<Container ref={assignRef(ref, innerRef)} zIndex={zIndex} {...props}>
      {renderContent({ containerRef: innerRef })}
    </Container>);
});
