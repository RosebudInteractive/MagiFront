import moment from 'moment';
import { TaskState } from './task';

export type Process = {
  Tasks: any[],
  Deps: any[],
};

export type TaskDependence = {
  Id: number,
  DepTaskId: number,
  TaskId: number,
  Expression: string,
  IsConditional?: boolean,
  IsActive: boolean,
};

export type TreeTask = {
  id: number,
  name: string,
  state: TaskState,
  dueDate: string,
  isFinal: boolean,
  isAutomatic: boolean,
  disabled: boolean,
  isExpired: any,
  executorName: string,
  weight: number | undefined,
  rowNumber: number | undefined,
  index: number,
  dependencies: { count: number, nodes: number[] },
  hasInlines: boolean,
  hasOutlines: boolean,
};

export type TreeDependence = {
  id: number,
  from: number,
  to: number,
  expression: string,
  hasCondition: boolean,
  disabled: boolean,
  offsetStart: number | undefined,
  offsetEnd: number | undefined,
};
