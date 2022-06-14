import { Process, TreeDependence, TreeTask } from '../../@types/process';
export declare type ProcessTree = {
    nodes: {
        [taskId: number]: TreeTask;
    };
    lines: TreeDependence[];
    rowCount: number;
    colCount: number;
};
export declare class Tree {
    private readonly tree;
    private process;
    private offsetCalculator;
    constructor();
    build(process: Process): ProcessTree;
    private clear;
    private initNodes;
    private initLines;
    private getRoots;
    private calcSize;
    private compress;
    calcOffset(): void;
    calcOffset2(): void;
}
declare const instance: Tree;
export default instance;
//# sourceMappingURL=tree-builder.d.ts.map