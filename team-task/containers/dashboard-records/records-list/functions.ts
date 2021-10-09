import $ from 'jquery';
import moment from 'moment';
import {GRID_SORT_DIRECTION} from '../../../constants/common';
import {DASHBOARD_PROCESS_STATE, PROCESS_STATE} from '../../../constants/states';
import {FILTER_FIELD_TYPE, FilterField, FilterFieldOptions, FilterValue,} from '../../../@types/common';

const processStates: FilterFieldOptions[] = Object.values(PROCESS_STATE)
  .map((state) => ({ label: state.label, value: state.value }));

processStates.push({ label: 'Без процесса', value: -1 });

export const getFilterConfig = (filter: FilterValue, courseOptions = []): FilterField[] => [
  {
    name: 'Course',
    placeholder: 'Название курса',
    type: FILTER_FIELD_TYPE.AUTOCOMPLETE,
    value: filter ? filter.Course : null,
    options: courseOptions,
  },
  {
    name: 'DateRange',
    placeholder: 'Период',
    type: FILTER_FIELD_TYPE.DATE_RANGE,
    // eslint-disable-next-line func-names
    value: (function () {
      if (filter && filter.DateRange
            && Array.isArray(filter.DateRange)
            && (filter.DateRange.length === 2)
            && filter.DateRange.every((date) => date !== null && date !== undefined)) {
        return [new Date(filter.DateRange[0]), new Date(filter.DateRange[1])];
      }
      return null;
    }()),
  },
  {
    name: 'ProcessState',
    placeholder: 'Статус процесса',
    type: FILTER_FIELD_TYPE.COMBO,
    value: filter ? filter.ProcessState : null,
    options: processStates,
  },
];

type Params = {
  order?: { field: string, direction: string };
  filter?: any
};

type FilterParams = {
  Course?: string | null,
  DateRange?: any[] | null,
  ProcessState?: string | null,
  WoProc: string | null,
};

const convertParam2Filter = (data : FilterParams): FilterValue | null => {
  const {
    Course, DateRange, ProcessState, WoProc,
  } = data;

  const dateRangeEmpty = !DateRange
      || (Array.isArray(DateRange) && DateRange.every((item) => !item));
  const isEmptyData = !(Course || ProcessState || WoProc) && dateRangeEmpty;

  if (isEmptyData) return null;

  const filter: FilterValue = {};

  if (Course) filter.Course = +Course;

  if (ProcessState || WoProc) {
    const states = ProcessState ? ProcessState.split(',') : [];
    if (WoProc) {
      states.push('-1');
    }
    filter.ProcessState = states.map((pr) => +pr);
  }

  const dateRangeDefined = DateRange
                        && (DateRange.length === 2)
                        && DateRange
                          .every((d) => d !== null && d !== undefined);

  if (dateRangeDefined) { filter.DateRange = DateRange; }

  return filter;
};

export const parseParams = () => {
  const paramsData: Params = {};
  // eslint-disable-next-line no-restricted-globals
  const searchParams = new URLSearchParams(location.search);
  const Course = searchParams.get('course') || null;
  const ProcessState = searchParams.get('procState') || null;
  const WoProc = searchParams.get('woProc') || null;
  const DateRangeStart = searchParams.get('st_date');
  const DateRangeEnd = searchParams.get('fin_date');

  const DateRange = [DateRangeStart, DateRangeEnd];

  const orderParam = searchParams.get('order');
  if (orderParam) {
    const order = orderParam.split(',');
    paramsData.order = {
      field: order[0],
      direction: order[1] ? order[1] : GRID_SORT_DIRECTION.ACS,
    };
  }

  const filter = convertParam2Filter(
    {
      Course,
      DateRange,
      ProcessState,
      WoProc,
    },
  );

  if (filter) {
    paramsData.filter = filter;
  }

  return paramsData;
};

export const convertFilter2Params = (filter: FilterValue): any => {
  const data: FilterValue = {};

  if (filter) {
    if (filter.Course) {
      data.course = filter.Course;
    }

    if (filter.ProcessState
        && Array.isArray(filter.ProcessState)
        && (filter.ProcessState.length > 0)) {
      if (filter.ProcessState.includes(-1)) {
        data.woProc = true;
      }

      data.procState = filter.ProcessState.filter((el: number) => el !== -1).join(',').toString();
    }

    if (filter.DateRange && Array.isArray(filter.DateRange)) {
      const dates = filter.DateRange;

      if (dates.length === 2 && dates.every((d: any) => d !== null && d !== undefined)) {
        data.st_date = `${moment(dates[0]).locale('ru').toISOString()}`;
        data.fin_date = `${moment(dates[1]).locale('ru').toISOString()}`;
      }
    }
  }

  return data;
};

export const resizeHandler = (rowCount: number) => {
  const $form = $('.form');
  const height: number = $form.height() || 0;
  const width: number = $form.width() || 0;

  // @ts-ignore
  if (window.$$('dashboard-records-grid')) {
    // @ts-ignore
    const { headerRowHeight } = window.$$('dashboard-records-grid').config;

    setTimeout(() => {
      let gridHeight = height - headerRowHeight - 48;

      const calcHeight = (rowCount * 80) + headerRowHeight + 60 + Math.ceil((rowCount / 7) * 15);

      // eslint-disable-next-line no-restricted-globals
      gridHeight = (calcHeight && calcHeight > 0 && !isNaN(calcHeight)) ? calcHeight : gridHeight;

      // @ts-ignore
      window.$$('dashboard-records-grid').$setSize(width, gridHeight);
      $('.horizontal-scroll-grid').height(gridHeight);
    }, 200);
  }
};

export const refreshColumns = (config: any) => {
  // @ts-ignore
  const grid = window.$$('dashboard-records-grid');

  if (grid) {
    grid.refreshColumns(config);
  }
};

export const getProcessState = (val: number) => {
  if (val) {
    const processState = Object.values(DASHBOARD_PROCESS_STATE).find((prS) => prS.value === val);
    return processState ? { css: processState.css, label: processState.label } : { css: '', label: '--' };
  }
  return { css: '', label: '' };
};
