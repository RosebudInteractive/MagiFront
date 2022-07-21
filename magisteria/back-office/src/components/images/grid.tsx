import React, { useEffect } from 'react';
import { ui } from 'webix';
import type { ImageInfo } from '#types/images';
import Webix from '#src/components/Webix';
import './grid.sass';

export interface ImagesGridProps {
  id?: string;
  absolutePath?: boolean;
  data: Array<ImageInfo> | null;
  selected?: number | string | null;
  onDelete?: (id: number) => void;
  onImageClick?: (metaData: ImageInfo) => void;
  onDoubleClick?: (metaData: ImageInfo) => void;
}

export const ImagesGrid = ({
  id, data = [], onDelete, onImageClick, onDoubleClick, selected, absolutePath = false,
}: ImagesGridProps) => {
  const gridId = `images-grid${id ? ` ${id}` : ''}`;

  const GRID_CONFIG: ui.datatableConfig = {
    view: 'datatable',
    id: gridId,
    css: 'tt-grid',
    hover: 'row-hover',
    scroll: 'none',
    headerRowHeight: 40,
    rowHeight: 72,
    height: 1000,
    select: true,
    editable: false,
    columns: [
      {
        id: 'image',
        header: 'Изображение',
        css: 'webix__image-cell',
        fillspace: 20,
        maxWidth: 100,
        template(obj: ImageInfo) {
          const horizontal: boolean = obj.metaData.size.width > obj.metaData.size.height;
          const path = obj.metaData.content.icon
              || obj.metaData.content.s
              || obj.metaData.content.m
              || obj.metaData.content.l
              || null;

          const prefix = absolutePath ? '' : obj.metaData.path;
          const file = path ? prefix + path : obj.fileName;
          const src = absolutePath ? file : `/data/${file}`;
          return `<div class="image-cell__wrapper">
                    <img class="image-cell ${horizontal ? ' _horizontal' : ' _vertical'}" src='${src}' alt='${obj.name}'/>
                </div>`;
        },
      },
      { id: 'name', header: 'Название', fillspace: 25 },
      { id: 'authorText', header: 'Автор', fillspace: 25 },
      {
        id: 'isNew',
        header: { text: 'Новый', css: { 'text-align': 'center' } },
        css: 'center-align-column',
        minWidth: 50,
        fillspace: 7,
        template(obj: ImageInfo) {
          return `<div class='${'check-box-block'} ${obj.isNew ? 'checked' : ''}'>
                        <div class=${obj.isNew ? 'check-mark' : ''}></div>
                        </div>`;
        },
      },
      {
        id: 'isFragment',
        header: { text: 'Фрагмент', css: { 'text-align': 'center' } },
        css: 'center-align-column',
        minWidth: 50,
        fillspace: 7,
        template(obj: ImageInfo) {
          return `<div class='${'check-box-block'} ${obj.isFragment ? 'checked' : ''}'>
                        <div class=${obj.isFragment ? 'check-mark' : ''}></div>
                        </div>`;
        },
      },
      {
        id: 'linkTypeId',
        header: 'тип связи',
        css: 'column-with-tooltip',
        minWidth: 50,
        fillspace: 8,
        template(obj: ImageInfo) {
          switch ((obj.linkTypeId || '').toString()) {
            case '3': return `<div class="cell-with-tooltip">
              <div class="cell-with-tooltip__cell">
                  <div class="cell-with-tooltip__text _green">И</div>
                  <div class="cell-with-tooltip__tooltip _green">Иллюстративная</div>
              </div>
            </div>`;
            case '4': return `<div class="cell-with-tooltip">
              <div class="cell-with-tooltip__cell">
                  <div class="cell-with-tooltip__text _blue">А</div>
                  <div class="cell-with-tooltip__tooltip _blue">Ассоциативная</div>
              </div>
            </div>`;
            default: return '';
          }
        },
      },
      {
        id: 'status',
        header: 'модерация',
        css: 'column-with-tooltip',
        minWidth: 50,
        fillspace: 8,
        template(obj: ImageInfo) {
          return obj.isModerated
            ? `<div class="cell-with-tooltip">
              <div class="cell-with-tooltip__cell">
                  <div class="cell-with-tooltip__circle _green"></div>
                  <div class="cell-with-tooltip__tooltip _green">Прошел модерацию</div>
              </div>    
            </div>`
            : `<div class="cell-with-tooltip">
              <div class="cell-with-tooltip__cell">
                  <div class="cell-with-tooltip__circle _red"></div>
                  <div class="cell-with-tooltip__tooltip _red">Требуется модерация</div>
              </div>
            </div>`;
        },
      },
      {
        id: 'timeCr',
        header: 'СОЗДАНО',
        fillspace: 8,
        format(value: string) {
          const fn = window.webix.Date.dateToStr('%d.%m.%Y', false);
          return value ? fn(new Date(value)) : '';
        },
      },
    ],
    on: {
      onItemClick(rowData: { row: number; column: string }) {
        if (rowData.column === 'image' && onImageClick) {
          // eslint-disable-next-line react/no-this-in-sfc
          const item: ImageInfo = this.getItem(rowData.row);
          onImageClick(item);
        }
      },
      onItemDblClick(uid: string) {
        // eslint-disable-next-line react/no-this-in-sfc
        const item: ImageInfo = this.getItem(uid);

        if (onDoubleClick) onDoubleClick(item);
      },
    },
    onClick: {
      'js-delete': function (e: MouseEvent, evData:{ row: number; column: string }) {
        e.preventDefault();
        // eslint-disable-next-line react/no-this-in-sfc
        const item: ImageInfo = this.getItem(evData.row);
        if (item && onDelete) {
          onDelete(item.id);
        }
      },
    },
  };

  if (onDelete && GRID_CONFIG.columns) {
    GRID_CONFIG.columns.push({
      id: 'del-btn',
      header: '',
      width: 50,
      css: 'center-align-column',
      template() { return "<button class='grid-button _delete js-delete'/>"; },
    });
  }

  useEffect(() => {
    if (selected) {
      // @ts-ignore
      const grid = window.$$(gridId);
      if (grid) {
        const item = grid.getItemNode({ row: selected });

        if (item) {
          grid.select(selected);
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }, [selected]);

  return (
    <div className="images-grid">
      <div className="grid-container unselectable">
        <Webix ui={GRID_CONFIG} data={data} />
      </div>
    </div>
  );
};
