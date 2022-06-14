import React from 'react';
// import { GRID_SORT_DIRECTION } from '#src/constants/common';
import { ReactComponent as PlusIco } from '#src/assets/svg/plus.svg';
import Webix from '#src/components/Webix';
import './grid.sass';
export const ImagesGrid = ({ data = [], onAdd, onImageClick }) => {
    const GRID_CONFIG = {
        view: 'datatable',
        id: 'images-grid',
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
                template(obj) {
                    const horizontal = obj.metaData.size.width > obj.metaData.size.height;
                    const path = obj.metaData.content.icon
                        || obj.metaData.content.s
                        || obj.metaData.content.m
                        || obj.metaData.content.l
                        || null;
                    const file = path ? obj.metaData.path + path : obj.fileName;
                    return `<img class="image-cell ${horizontal ? ' _horizontal' : ' _vertical'}" src='/data/${file}'/>`;
                },
            },
            { id: 'name', header: 'Название', fillspace: 25 },
            { id: 'description', header: 'Описание', fillspace: 25 },
            {
                id: 'isNew',
                header: 'Новый',
                // format: (value) => {return value ? 'Да' : 'Нет'},
                css: '_container',
                minWidth: 50,
                fillspace: 7,
                template(obj) {
                    return `<div class='${'check-box-block'} ${obj.isNew ? 'checked' : ''}'>
                        <div class=${obj.isNew ? 'check-mark' : ''}></div>
                        </div>`;
                },
            },
            {
                id: 'isFragment',
                header: 'Фрагмент',
                // format: (value) => {return value ? 'Да' : 'Нет'},
                css: '_container',
                minWidth: 50,
                fillspace: 7,
                template(obj) {
                    return `<div class='${'check-box-block'} ${obj.isFragment ? 'checked' : ''}'>
                        <div class=${obj.isFragment ? 'check-mark' : ''}></div>
                        </div>`;
                },
            },
            {
                id: 'showInGallery',
                header: 'В галерее',
                // format: (value) => {return value ? 'Да' : 'Нет'},
                css: '_container',
                minWidth: 50,
                fillspace: 9,
                template(obj) {
                    return `<div class='${'check-box-block'} ${obj.showInGallery ? 'checked' : ''}'>
                        <div class=${obj.showInGallery ? 'check-mark' : ''}></div>
                        </div>`;
                },
            },
            {
                id: 'linkTypeId',
                header: 'Связь',
                format: (value) => {
                    switch (value) {
                        case 3: return 'И';
                        case 4: return 'А';
                        default: return '';
                    }
                },
                css: '_container',
                minWidth: 50,
                fillspace: 9,
                // template(obj: ImageInfo) {
                //   return `<div class='${'check-box-block'} ${obj.showInGallery ? 'checked' : ''}'>
                //                 <div class=${obj.showInGallery ? 'check-mark' : ''}></div>
                //                 </div>`;
                // },
            },
            {
                id: 'status',
                header: 'Статус',
                format: (value) => {
                    switch (value) {
                        case 3: return 'И';
                        case 4: return 'А';
                        default: return '';
                    }
                },
                css: '_container',
                minWidth: 50,
                fillspace: 9,
                // template(obj: ImageInfo) {
                //   return `<div class='${'check-box-block'} ${obj.showInGallery ? 'checked' : ''}'>
                //                 <div class=${obj.showInGallery ? 'check-mark' : ''}></div>
                //                 </div>`;
                // },
            },
            {
                id: 'TimeCr',
                header: 'СОЗДАНО',
                fillspace: 7,
                format(value) {
                    const fn = window.webix.Date.dateToStr('%d.%m.%Y', false);
                    return value ? fn(new Date(value)) : '';
                },
            },
            // {
            //   id: 'Id', header: 'ID ЗАДАЧИ', autofill: 10, css: '_number-field',
            // },
            // { id: 'ElementName', header: 'ЭЛЕМЕНТ', autofill: 8 }, // Нет сортировки
            // {
            //   id: 'UserName', header: 'ИСПОЛНИТЕЛЬ', width: 170, autofill: 20,
            // }, // UserName
            // {
            //   id: 'DueDate',
            //   header: 'ВЫПОЛНИТЬ ДО',
            //   autofill: 11,
            //   format(value: string) {
            //     const fn = window.webix.Date.dateToStr('%d.%m.%Y', false);
            //     return value ? fn(new Date(value)) : '';
            //   },
            // },
            // {
            //   id: 'State',
            //   header: 'СОСТОЯНИЕ',
            //   width: 150,
            //   css: '_container',
            //   template(value: any) {
            //     return `<div class="task-state ${value.css}">${value.label}</div>`;
            //   },
            // },
        ],
        on: {
            onItemClick: function (rowData) {
                if (rowData.column === 'image' && onImageClick) {
                    const item = this.getItem(rowData.row);
                    onImageClick(item);
                }
            },
        },
    };
    return (<div className="images-grid">
      {onAdd && (<button type="button" className="process-button _add" onClick={onAdd}>
        <PlusIco />
      </button>)}
      <div className="grid-container unselectable">
        <Webix ui={GRID_CONFIG} data={data}/>
      </div>
    </div>);
};
