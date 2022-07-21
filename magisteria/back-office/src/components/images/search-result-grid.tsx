import React, { useEffect, useRef } from 'react';
import { ui } from 'webix';
import type { SearchResultItem } from '#types/images';
import Webix from '#src/components/Webix';
import './grid.sass';

export interface ImagesGridProps {
  id?: string;
  fitImageToCell?: boolean;
  data: Array<SearchResultItem> | null;
  onImageClick?: (metaData: SearchResultItem) => void;
  onDoubleClick?: (metaData: SearchResultItem) => void;
}

export const SearchResultGrid = ({
  id, fitImageToCell = true, data = [], onImageClick, onDoubleClick,
}: ImagesGridProps) => {
  const gridId = `images-search-grid${id ? ` ${id}` : ''}`;
  const containerRef = useRef<HTMLDivElement>(null);

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
        css: `webix__image-cell${fitImageToCell ? ' _cropped' : ''}`,
        fillspace: 20,
        maxWidth: 300,
        template(obj: SearchResultItem) {
          const path = obj.metaData.content.s
              || obj.metaData.content.m
              || obj.metaData.content.l
              || null;

          const src = path || obj.fileName;
          return `<div class="image-cell__wrapper">
                    <img class="image-cell ${!fitImageToCell ? ' _cropped' : ''}" src='${src}' alt='${obj.name}'/>
                </div>`;
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

  useEffect(() => {
    if (containerRef && containerRef.current) {
      const list = containerRef.current.getElementsByClassName('image-cell');
      if (list) {
        Array.from(list).forEach((item) => {
          if (!fitImageToCell) {
            item.classList.add('_cropped');
          } else {
            item.classList.remove('_cropped');
          }
        });
      }
    }
  }, [fitImageToCell]);

  return (
    <div ref={containerRef} className="grid-container unselectable _with-custom-scroll">
      <Webix ui={GRID_CONFIG} data={data} />
    </div>
  );
};
