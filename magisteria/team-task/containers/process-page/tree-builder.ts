import moment from 'moment';
import {
  Process, TaskDependence, TreeDependence, TreeTask,
} from '../../@types/process';
import { Task } from '../../@types/task';
import calcNodesWeight, { CalcResult } from './calc-nodes-weight';
import OffsetCalculator from './offset-calculator';

export type ProcessTree = {
  nodes: { [taskId: number]: TreeTask },
  lines: TreeDependence[],
  rowCount: number,
  colCount: number,
};

export class Tree {
  private readonly tree: ProcessTree;

  private process: Process | null;

  private offsetCalculator: OffsetCalculator;

  constructor() {
    this.tree = {
      nodes: {},
      lines: [],
      rowCount: 0,
      colCount: 0,
    };

    this.process = null;
    this.offsetCalculator = new OffsetCalculator();
  }

  public build(process: Process): ProcessTree {
    this.clear();
    this.process = process;
    this.initNodes();
    this.initLines();

    const roots = this.getRoots();

    let row = 0;
    roots.forEach((item: TreeTask) => {
      const result: CalcResult = calcNodesWeight(this.tree.nodes, item, 0, row);
      row = result.row + 1;
    });

    this.calcSize();
    this.compress();
    this.offsetCalculator.execute(this.tree);
    // this.calcOffset();
    // this.calcOffset2();
    return this.tree;
  }

  private clear() {
    this.tree.nodes = {};
    this.tree.lines = [];
    this.tree.rowCount = 0;
    this.tree.colCount = 0;
  }

  private initNodes() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.process && this.process.Tasks.forEach((task: Task, index: number) => {
      this.tree.nodes[task.Id] = {
        id: task.Id,
        name: task.Name,
        state: task.State,
        dueDate: task.DueDate,
        isFinal: task.IsFinal,
        isAutomatic: task.IsAutomatic,
        disabled: !task.IsActive,
        isExpired: moment(task.DueDate).isBefore(moment()),
        executorName: task.Executor ? task.Executor.DisplayName : '',
        weight: undefined,
        rowNumber: undefined,
        index,
        dependencies: { count: 0, nodes: [] },
        hasInlines: false,
        hasOutlines: false,
      };
    });
  }

  private initLines() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.process && this.process.Deps.forEach((dep: TaskDependence) => {
      if (this.tree.nodes[dep.TaskId]) {
        this.tree.nodes[dep.TaskId].dependencies.count += 1;
      }

      if (this.tree.nodes[dep.DepTaskId]) {
        this.tree.nodes[dep.DepTaskId].dependencies.nodes.push(dep.TaskId);
      }

      this.tree.lines.push({
        id: dep.Id,
        from: dep.DepTaskId,
        to: dep.TaskId,
        expression: dep.Expression,
        hasCondition: !!dep.IsConditional,
        disabled: !dep.IsActive,
        offsetStart: undefined,
        offsetEnd: undefined,
      });
    });
  }

  private getRoots() {
    return Object.values(this.tree.nodes).filter((item: TreeTask) => item.dependencies.count === 0);
  }

  private calcSize() {
    Object.values(this.tree.nodes).forEach((item: TreeTask) => {
      if (this.tree.colCount < (item.weight || 0)) {
        this.tree.colCount = item.weight || 0;
      }
      if (this.tree.rowCount < (item.rowNumber || 0)) {
        this.tree.rowCount = item.rowNumber || 0;
      }

      // eslint-disable-next-line no-param-reassign
      item.hasInlines = item.dependencies.nodes.length > 0;
      // eslint-disable-next-line no-param-reassign
      item.hasOutlines = item.dependencies.nodes.length > 0;
    });

    this.tree.rowCount += 1;
    this.tree.colCount += 1;
  }

  private compress() {
    const treeNodes = Object.values(this.tree.nodes);
    let { rowCount } = this.tree;

    // eslint-disable-next-line for-direction,no-plusplus
    for (let i = rowCount - 1; i > 0; i--) {
      const rowNotEmpty = treeNodes.some((node: TreeTask) => node.rowNumber === i);

      // eslint-disable-next-line no-continue
      if (rowNotEmpty) continue;

      treeNodes.forEach((node: TreeTask) => {
        if (node.rowNumber && (node.rowNumber > i)) {
          // eslint-disable-next-line no-param-reassign
          node.rowNumber -= 1;
        }
      });

      rowCount -= 1;
    }

    this.tree.rowCount = rowCount;
  }

  calcOffset() {

  }

  calcOffset2() {

  }
}

const instance: Tree = new Tree();

export default instance;
