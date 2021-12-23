import React, { useMemo } from 'react';
import SerifItem from './item';

declare type Props = {
  points: number[],
  yearPerPixel: number,
  width: number,
  startDate: number,
};

export default function Serifs(props: Props): JSX.Element {
  const {
    points, yearPerPixel, width, startDate,
  } = props;

  const serifs = useMemo(() => points.map((event) => (
    <SerifItem
      yearPerPixel={yearPerPixel}
      startDate={startDate}
      year={event}
      key={event}
      rightBound={width}
    />
  )), [points, startDate, yearPerPixel]);

  return <>{serifs}</>;
}
