import React from 'react';
import './canvas.sass';

export interface CanvasProps extends JSX.ElementChildrenAttribute {
  paddingLeft: number;
  paddingRight: number;
}

const Canvas = function ({ paddingLeft, paddingRight, children }: CanvasProps): JSX.Element {
  const style = React.useMemo(() => ({
    marginLeft: paddingLeft,
    width: `calc(100% - ${paddingRight}px)`,
  }), [paddingLeft, paddingRight]);

  return (
    <div className="timeline-canvas__inner" style={style}>
      {children}
    </div>
  );
};

export default Canvas;
