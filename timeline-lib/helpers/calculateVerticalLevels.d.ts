import { IVerticalPlaceable } from '../types/common';
export default function calculateVerticalLevels(records: Array<IVerticalPlaceable>, levelLimit: number, checkVisibility?: boolean): {
    items: IVerticalPlaceable[];
    levelsCount: number;
};
