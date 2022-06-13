import { stringToDirection, SortDirection } from '#src/constants/common';

export type Params = {
  lessonId?: string;
  order?: { field: string; direction: SortDirection };
  pathname?: string;
};

export const parseParams = () => {
  const paramsData: Params = {};

  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get('lessonId');
  if (lessonId) {
    paramsData.lessonId = lessonId;
  }

  const orderValue = params.get('order');
  if (orderValue) {
    const order = orderValue.split(',');
    paramsData.order = { field: order[0], direction: stringToDirection(order[1]) };
  }

  return paramsData; // || savedFilters.getFor(FILTER_KEY.TASKS);
};
