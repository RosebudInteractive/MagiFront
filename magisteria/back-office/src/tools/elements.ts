import { ELEMENT_STATE } from '../constants/states';
import { SelectOptions } from '#types/common';

export const getStatesForSelect = (): SelectOptions => Object.values(ELEMENT_STATE)
  .map((item) => ({ id: item.value.toString(), name: item.label }));

export const getState = (state: number) => {
  switch (state) {
    case 1: return { caption: 'Не готов', css: '_not-ready' };
    case 2: return { caption: 'Частично готов', css: '_part-ready' };
    case 3: return { caption: 'Готов', css: '_ready' };
    default: return { caption: 'Ошибка', css: '_error' };
  }
};
