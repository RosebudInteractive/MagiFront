import type { ImageInfo } from '#types/images';
export interface ImagesGridProps {
    data: Array<ImageInfo>;
    onAdd?: () => void;
    onEdit?: () => void;
    onDelete?: (id: number) => void;
}
export declare const ImagesGrid: ({ data, onAdd }: ImagesGridProps) => JSX.Element;
//# sourceMappingURL=grid.d.ts.map