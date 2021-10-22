/// <reference types="react" />
import { Period } from '../../../types/period';
declare type Props = {
    startDate: number;
    yearPerPixel: number;
    periods: Period.VisualItem[];
    levelLimit: number | null;
    y: number;
    elementsOverAxis: boolean;
    activeItem: number | null;
    onItemClick: Function;
    onSetLevelsCount: Function;
};
export default function PeriodSections(props: Props): JSX.Element;
export {};
