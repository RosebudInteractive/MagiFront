import React from 'react';
import Webix from '#src/components/Webix';
import './grid.sass';
export const SearchResultGrid = ({ id, data = [], onImageClick, onDoubleClick, }) => {
    const gridId = `images-search-grid${id ? ` ${id}` : ''}`;
    const GRID_CONFIG = {
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
                template(obj) {
                    const horizontal = obj.metaData.size.width > obj.metaData.size.height;
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
                template(obj) {
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
                template(obj) {
                    return `<div class='search-result__size'>
            ${obj.metaData.size.width}x${obj.metaData.size.height}
          </div>`;
                },
            },
        ],
        on: {
            onItemClick(rowData) {
                if (rowData.column === 'image' && onImageClick) {
                    // eslint-disable-next-line react/no-this-in-sfc
                    const item = this.getItem(rowData.row);
                    onImageClick(item);
                }
            },
            onItemDblClick(uid) {
                // eslint-disable-next-line react/no-this-in-sfc
                const item = this.getItem(uid);
                if (onDoubleClick)
                    onDoubleClick(item);
            },
        },
    };
    return (<div className="grid-container unselectable _with-custom-scroll">
      <Webix ui={GRID_CONFIG} data={data}/>
    </div>);
};
