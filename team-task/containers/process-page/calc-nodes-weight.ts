import { TreeTask } from '../../@types/process';

export type CalcResult = { row: number, firstVisit: boolean };

export default function calcNodesWeight(nodes: { [taskId: number]: TreeTask }, node: TreeTask,
  level: number, row: number): CalcResult {
  const firstVisit = node.rowNumber === undefined;

  // eslint-disable-next-line no-param-reassign
  node.weight = ((node.weight === undefined) || (level > node.weight)) ? level : node.weight;

  // eslint-disable-next-line no-param-reassign
  node.rowNumber = (firstVisit || (row < (node.rowNumber || 0))) ? row : node.rowNumber;

  let closureRow = row;

  node.dependencies.nodes.forEach((nodeId, index, array) => {
    const result = calcNodesWeight(nodes, nodes[nodeId], level + 1, closureRow);
    closureRow = result.row;
    const isLastChild = index === (array.length - 1);
    const needIncRow = result.firstVisit && !isLastChild;
    if (needIncRow) {
      closureRow += 1;
    }
  });

  return { row: closureRow, firstVisit };
}
