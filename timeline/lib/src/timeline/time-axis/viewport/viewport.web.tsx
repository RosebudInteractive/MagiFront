import React from 'react';
import './viewport.sass';

export interface ViewportProps extends JSX.ElementChildrenAttribute {
  width: number;
  height: number;
}

const Viewport = function ({ width, height, children }: ViewportProps): JSX.Element {
  const style = React.useMemo(() => ({ width, height }), [width, height]);

  return (
    <div className="timeline-canvas" style={style}>
      {children}
    </div>
  );
};

export default Viewport;
