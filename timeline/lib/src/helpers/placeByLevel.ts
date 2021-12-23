import calculateVerticalLevels from './calculateVerticalLevels';
import { IVerticalPlaceable } from '../types/common';

function placeByYLevelLimit(
  records: IVerticalPlaceable[],
  limit: number,
  checkVisibility: boolean = true,
): any {
  return calculateVerticalLevels(records, limit, checkVisibility);
}

export default placeByYLevelLimit;
