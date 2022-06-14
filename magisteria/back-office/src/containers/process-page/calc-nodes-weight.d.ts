import { TreeTask } from '../../@types/process';
export declare type CalcResult = {
    row: number;
    firstVisit: boolean;
};
export default function calcNodesWeight(nodes: {
    [taskId: number]: TreeTask;
}, node: TreeTask, level: number, row: number): CalcResult;
//# sourceMappingURL=calc-nodes-weight.d.ts.map