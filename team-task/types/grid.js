import {GRID_SORT_DIRECTION} from "../constants/common";

export type GridSortOrder = {
    field: string,
    direction: $Values<typeof GRID_SORT_DIRECTION>
}
