import React from 'react';
import { ui } from 'webix';
import type { SearchResultItem } from '#types/images';
import Webix from '#src/components/Webix';
import './grid.sass';

export interface ImagesGridProps {
  id?: string;
  absolutePath?: boolean;
  data: Array<SearchResultItem> | null;
  onImageClick?: (metaData: SearchResultItem) => void;
  onDoubleClick?: (metaData: SearchResultItem) => void;
}

export const SearchResultGrid = ({
  id, data = [], onImageClick, onDoubleClick,
}: ImagesGridProps) => {
  const gridId = `images-search-grid${id ? ` ${id}` : ''}`;

  const GRID_CONFIG: ui.datatableConfig = {
    view: 'datatable',
    id: gridId,
    css: 'tt-grid',
    hover: 'row-hover',
    scroll: 'none',
    headerRowHeight: 40,
    rowHeight: 192,
    height: 1000,
    select: true,
    editable: false,
    columns: [
      {
        id: 'image',
        header: 'Изображение',
        css: 'webix__image-cell',
        fillspace: 20,
        maxWidth: 300,
        template(obj: SearchResultItem) {
          const horizontal: boolean = obj.metaData.size.width > obj.metaData.size.height;
          const path = obj.metaData.content.s
              || obj.metaData.content.m
              || obj.metaData.content.l
              || null;

          const src = path || obj.fileName;
          return `<img class="image-cell ${horizontal ? ' _horizontal' : ' _vertical'}" src='${src}'/>`;
        },
      },
      {
        id: 'name',
        header: 'Название',
        fillspace: 25,
        template(obj: SearchResultItem) {
          return `<div class='search-result__image-info'>
            <div class='search-result__image-name font-body-m'>${obj.name}</div>
            <div class='search-result__image-desc font-subtitle'>${obj.description || ''}</div>
          </div>`;
        },
      },
      {
        id: 'size',
        header: { text: 'размер', css: { 'text-align': 'center' } },
        css: 'center-align-column',
        minWidth: 50,
        fillspace: 7,
        template(obj: SearchResultItem) {
          return `<div class='search-result__size'>
            ${obj.metaData.size.width}x${obj.metaData.size.height}
          </div>`;
        },
      },
    ],
    on: {
      onItemClick(rowData: { row: number; column: string }) {
        if (rowData.column === 'image' && onImageClick) {
          // eslint-disable-next-line react/no-this-in-sfc
          const item: SearchResultItem = this.getItem(rowData.row);
          onImageClick(item);
        }
      },
      onItemDblClick(uid: string) {
        // eslint-disable-next-line react/no-this-in-sfc
        const item: SearchResultItem = this.getItem(uid);

        if (onDoubleClick) onDoubleClick(item);
      },
    },
  };

  return (
    <div className="grid-container unselectable _with-custom-scroll">
      <Webix ui={GRID_CONFIG} data={data} />
    </div>
  );
};
