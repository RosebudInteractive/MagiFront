import { ProcessTree } from './tree-builder';
import { TreeDependence } from '../../@types/process';

enum LineType {
  In = 'in',
  Out = 'out',
}

type LineData = {
  endRow?: number,
  endColumn?: number,
  startRow?: number,
  startColumn?: number,
  wayLength: number,
  line: TreeDependence,
  flat: boolean,
};

export default class OffsetCalculator {
  private tree: ProcessTree | null;

  constructor() {
    this.tree = null;
  }

  execute(tree: ProcessTree) {
    this.tree = tree;
    this.calcOutlineOffsets();
    this.calcInlineOffsets();
  }

  private calcOutlineOffsets() {
    if (!this.tree) return;

    const { nodes: treeNodes, lines: treeLines } = this.tree;

    Object.entries(treeNodes).forEach(([nodeId, node]) => {
      const { nodes } = node.dependencies;

      if (nodes.length > 1) {
        // @ts-ignore
        const lines: LineData[] = nodes
          .map((id: number) => {
            const line = treeLines.find((item: TreeDependence) => ((item.from === +nodeId)
                        && (item.to === id)));

            if (line) {
              const endRow = treeNodes[line.to].rowNumber || 0;
              const endColumn = treeNodes[line.to].weight || 0;
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
          })
          .filter((item) => item !== null);

        const arrows = OffsetCalculator.createSortedLines(node.rowNumber, lines, LineType.In);
        const count = arrows.length;

        const centerOffset = ((count - 1) % 2) * 0.5 * 20;

        /* eslint-disable no-param-reassign */
        arrows.forEach((item, index) => {
          if (item) {
            item.line.offsetStart = (count - 1 - (count - index)) * 20 + centerOffset;
            if (item.flat) {
              item.line.offsetEnd = item.line.offsetStart;
            }
          }
        });
        /* eslint-enable no-param-reassign */
      }
    });
  }

  private calcInlineOffsets() {
    if (!this.tree) return;

    const { nodes: treeNodes, lines: treeLines } = this.tree;

    Object.entries(treeNodes).forEach(([nodeId, node]) => {
      if (node.dependencies.count > 1) {
        const lines = treeLines
          .filter((line: TreeDependence) => (line.to === +nodeId))
          .map((line: TreeDependence) => {
            const startRow = treeNodes[line.from].rowNumber || 0;
            const startColumn = treeNodes[line.from].weight || 0;
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

        const arrows = OffsetCalculator.createSortedLines(node.rowNumber, lines, LineType.Out);
        const count = arrows.length;

        const centerOffset = ((count - 1) % 2) * 0.5 * 20;

        /* eslint-disable no-param-reassign */
        arrows.forEach((item, index) => {
          if (item) {
            if (item.flat && (item.line.offsetStart !== undefined)) {
              item.line.offsetEnd = item.line.offsetStart;
            } else {
              item.line.offsetEnd = (count - 1 - (count - index)) * 20 + centerOffset;

              if (item.line.offsetStart === undefined) {
                item.line.offsetStart = item.line.offsetEnd;
              }
            }
          }
        });
        /* eslint-enable no-param-reassign */
      }
    });
  }

  private static createSortedLines(nodeRow: number | undefined, lines: LineData[],
    lineType: LineType): LineData[] {
    const rowName: string = lineType === LineType.In ? 'endRow' : 'startRow';
    /* eslint-disable no-param-reassign */
    const upperArrows = lines
      .filter((item) => (nodeRow !== undefined) && ((item as any)[rowName] < nodeRow))
      .sort((a, b) => b.wayLength - a.wayLength);

    const rowArrows = lines
      .filter((item) => (nodeRow !== undefined) && ((item as any)[rowName] === nodeRow))
      .sort((a, b) => b.wayLength - a.wayLength);

    rowArrows.forEach((item) => { item.flat = true; });

    const bottomArrows = lines
      .filter((item) => (nodeRow !== undefined) && ((item as any)[rowName] > nodeRow))
      .sort((a, b) => b.wayLength - a.wayLength);

    return [...upperArrows, ...rowArrows, ...bottomArrows];
    /* eslint-enable no-param-reassign */
  }
}
