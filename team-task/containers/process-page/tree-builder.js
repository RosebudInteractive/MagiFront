import moment from 'moment';
import calcNodesWeight from './calc-nodes-weight';
export class Tree {
    tree;
    process;
    constructor() {
        this.tree = {
            nodes: {},
            lines: [],
            rowCount: 0,
            colCount: 0,
        };
        this.process = null;
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
        this.calcOffset();
        this.calcOffset2();
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
                offsetStart: 0,
                offsetEnd: 0,
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
        Object.entries(this.tree.nodes).forEach(([nodeId, node]) => {
            const { nodes } = node.dependencies;
            if (nodes.length > 1) {
                let lines = nodes.map((id) => {
                    const line = this.tree.lines.find((item) => ((item.from === +nodeId)
                        && (item.to === id)));
                    if (line) {
                        const endRow = this.tree.nodes[line.to].rowNumber || 0;
                        const endColumn = this.tree.nodes[line.to].weight || 0;
                        const wayLength = Math.sqrt((endColumn - (node.weight || 0)) ** 2
                            + (endRow - (node.rowNumber || 0) ** 2));
                        return {
                            endRow,
                            endColumn,
                            wayLength,
                            line,
                            flat: false,
                        };
                    }
                    return null;
                });
                lines = lines.filter((item) => item !== null);
                // @ts-ignore
                const upperArrows = lines.filter((item) => (item.endRow < node.rowNumber))
                    // @ts-ignore
                    .sort((a, b) => b.wayLength - a.wayLength);
                // @ts-ignore
                const rowArrows = lines.filter((item) => (item.endRow === node.rowNumber))
                    // @ts-ignore
                    .sort((a, b) => b.wayLength - a.wayLength);
                rowArrows.forEach((item) => {
                    // @ts-ignore
                    // eslint-disable-next-line no-param-reassign
                    item.flat = true;
                });
                // @ts-ignore
                const bottomArrows = lines.filter((item) => (item.endRow > node.rowNumber))
                    // @ts-ignore
                    .sort((a, b) => b.wayLength - a.wayLength);
                const arrows = [...upperArrows, ...rowArrows, ...bottomArrows];
                const count = arrows.length;
                arrows.forEach((item, index) => {
                    if (item) {
                        // eslint-disable-next-line no-param-reassign
                        item.line.offsetStart = (count - 1 - (count - index)) * 20;
                        if (item.flat) {
                            // eslint-disable-next-line no-param-reassign
                            item.line.offsetEnd = item.line.offsetStart;
                        }
                    }
                });
            }
        });
    }
    calcOffset2() {
        Object.entries(this.tree.nodes).forEach(([nodeId, node]) => {
            if (node.dependencies.count > 1) {
                const incomingLines = this.tree.lines
                    .filter((line) => (line.to === +nodeId))
                    .map((line) => {
                    const startRow = this.tree.nodes[line.from].rowNumber || 0;
                    const startColumn = this.tree.nodes[line.from].weight || 0;
                    const wayLength = Math.sqrt((startColumn - (node.weight || 0)) ** 2
                        + (startRow - (node.rowNumber || 0) ** 2));
                    return {
                        startRow,
                        startColumn,
                        wayLength,
                        line,
                        flat: false,
                    };
                });
                // @ts-ignore
                const upperArrows = incomingLines.filter((item) => (item.startRow < node.rowNumber))
                    .sort((a, b) => b.wayLength - a.wayLength);
                const rowArrows = incomingLines.filter((item) => (item.startRow === node.rowNumber))
                    .sort((a, b) => b.wayLength - a.wayLength);
                rowArrows.forEach((item) => {
                    // eslint-disable-next-line no-param-reassign
                    item.flat = true;
                });
                // @ts-ignore
                const bottomArrows = incomingLines.filter((item) => (item.startRow > node.rowNumber))
                    .sort((a, b) => b.wayLength - a.wayLength);
                const arrows = [...upperArrows, ...rowArrows, ...bottomArrows];
                const count = arrows.length;
                arrows.forEach((item, index) => {
                    if (item) {
                        if (item.flat) {
                            // eslint-disable-next-line no-param-reassign
                            item.line.offsetEnd = item.line.offsetStart;
                        }
                        else {
                            // eslint-disable-next-line no-param-reassign
                            item.line.offsetEnd = (count - 1 - (count - index)) * 20;
                        }
                    }
                });
            }
        });
    }
}
const instance = new Tree();
export default instance;
