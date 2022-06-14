import $ from 'jquery';
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

export const resizeHandler = (rowCount: number) => {
  const form = $('.form');
  const height = form.height();
  const width = form.width();

  // @ts-ignore
  if (window.$$('images-grid')) {
    // @ts-ignore
    const headerHeight = window.$$('images-grid').config.headerRowHeight;

    setTimeout(() => {
      let gridHeight = (height || 0) - headerHeight - 48;

      const calcHeight = (rowCount * 80) + headerHeight + 60;
      gridHeight = calcHeight > gridHeight ? calcHeight : gridHeight;
      // @ts-ignore
      window.$$('images-grid').$setSize(width, gridHeight);
    }, 0);
  }
};
