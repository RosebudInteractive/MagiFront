import moment from 'moment';
import calcNodesWeight from './calc-nodes-weight';
import OffsetCalculator from './offset-calculator';
export class Tree {
    tree;
    process;
    offsetCalculator;
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
    build(process) {
        this.clear();
        this.process = process;
        this.initNodes();
        this.initLines();
        const roots = this.getRoots();
        let row = 0;
        roots.forEach((item) => {
            const result = calcNodesWeight(this.tree.nodes, item, 0, row);
            row = result.row + 1;
        });
        this.calcSize();
        this.compress();
        this.offsetCalculator.execute(this.tree);
        // this.calcOffset();
        // this.calcOffset2();
        return this.tree;
    }
    clear() {
        this.tree.nodes = {};
        this.tree.lines = [];
        this.tree.rowCount = 0;
        this.tree.colCount = 0;
    }
    initNodes() {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.process && this.process.Tasks.forEach((task, index) => {
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
    initLines() {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.process && this.process.Deps.forEach((dep) => {
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
    getRoots() {
        return Object.values(this.tree.nodes).filter((item) => item.dependencies.count === 0);
    }
    calcSize() {
        Object.values(this.tree.nodes).forEach((item) => {
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
    compress() {
        const treeNodes = Object.values(this.tree.nodes);
        let { rowCount } = this.tree;
        // eslint-disable-next-line for-direction,no-plusplus
        for (let i = rowCount - 1; i > 0; i--) {
            const rowNotEmpty = treeNodes.some((node) => node.rowNumber === i);
            // eslint-disable-next-line no-continue
            if (rowNotEmpty)
                continue;
            treeNodes.forEach((node) => {
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
const instance = new Tree();
export default instance;
