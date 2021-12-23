import React, { CSSProperties } from 'react';

type Props = {
  color: string,
};

export default function Mask(props: Props) {
  const { color } = props;

  const style: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    borderBottomRightRadius: 4,
    background: `linear-gradient(90deg, transparent 65%, ${color} 100%)`,
  };

  return <div style={style} />;
}
