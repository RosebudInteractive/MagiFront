import $ from 'jquery';
import { stringToDirection, SortDirection } from '#src/constants/common';

export type Filter = {
  lessonId?: number;
};

export type Order = { field: string; direction: SortDirection };

export type Params = {
  filter?: SearchFilter;
  parsedFilter?: Filter;
  order?: Order;
  pathname?: string;
};

export type SearchFilter = {
  lessonId?: string | null;
};

const convertParam2Filter = ({ lessonId }: SearchFilter): Filter | null => {
  if (!lessonId) return null;

  const filter: Filter = {};
  filter.lessonId = parseInt(lessonId, 10);

  return filter;
};

export const parseParams = (): Params => {
  const paramsData: Params = {};

  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get('lessonId');

  const orderValue = params.get('order');
  if (orderValue) {
    const order = orderValue.split(',');
    paramsData.order = { field: order[0], direction: stringToDirection(order[1]) };
  }

  const filter = convertParam2Filter({ lessonId });
  if (filter) {
    paramsData.parsedFilter = filter;
  }

  return paramsData;
};

export const resizeHandler = (rowCount: number) => {
  const form = $('.form');
  const height = form.height();
  const width = form.width();

  // @ts-ignore
  if (window.$$('images-grid main')) {
    // @ts-ignore
    const headerHeight = window.$$('images-grid main').config.headerRowHeight;

    setTimeout(() => {
      let gridHeight = (height || 0) - headerHeight - 48;

      const calcHeight = (rowCount * 80) + headerHeight + 60;
      gridHeight = calcHeight > gridHeight ? calcHeight : gridHeight;
      // @ts-ignore
      window.$$('images-grid main').$setSize(width, gridHeight);
    }, 0);
  }
};

export const convertFilter2Params = (filter: Filter): SearchFilter => {
  const data: SearchFilter = {};

  if (filter) {
    if (filter.lessonId) data.lessonId = filter.lessonId.toString();
  }

  return data;
};
