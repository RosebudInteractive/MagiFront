export type SortDirection = 'asc' | 'desc';

export const GRID_SORT_DIRECTION: Record<string, SortDirection> = {
  ACS: 'asc',
  DESC: 'desc',
};

export const stringToDirection = (value: string): SortDirection => {
  if (value === 'asc' || value === 'desc') return value as SortDirection;

  return 'asc';
};

export const COMMENT_ACTION = {
  UPDATE: 'U',
  DELETE: 'D',
};

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  PMA: 'PMA',
  PMS: 'PMS',
  PME: 'PME',
  PMU: 'PMU',
};
