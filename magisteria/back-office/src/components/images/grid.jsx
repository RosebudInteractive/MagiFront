import React from 'react';
// import { GRID_SORT_DIRECTION } from '#src/constants/common';
import { ReactComponent as PlusIco } from '#src/assets/svg/plus.svg';
import Webix from '#src/components/Webix';
export const ImagesGrid = ({ data = [], onAdd }) => {
    const GRID_CONFIG = {
        view: 'datatable',
        id: 'tasks-grid',
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
                header: 'Image',
                fillspace: true,
                template(obj) {
                    return `<img src='/data/${obj.metaData.path}'/>`;
                },
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
            { id: 'ProcessName', header: 'ПРОЦЕСС', fillspace: 11 },
            { id: 'Name', header: 'Название', fillspace: 25 },
            {
                id: 'Id', header: 'ID ЗАДАЧИ', autofill: 10, css: '_number-field',
            },
            { id: 'ElementName', header: 'ЭЛЕМЕНТ', autofill: 8 },
            {
                id: 'UserName', header: 'ИСПОЛНИТЕЛЬ', width: 170, autofill: 20,
            },
            {
                id: 'DueDate',
                header: 'ВЫПОЛНИТЬ ДО',
                autofill: 11,
                format(value) {
                    const fn = window.webix.Date.dateToStr('%d.%m.%Y', false);
                    return value ? fn(new Date(value)) : '';
                },
            },
            {
                id: 'State',
                header: 'СОСТОЯНИЕ',
                width: 150,
                css: '_container',
                template(value) {
                    return `<div class="task-state ${value.css}">${value.label}</div>`;
                },
            },
        ],
        on: {
            onHeaderClick(header) {
                // const _sort: GridSortOrder = _sortRef.current;
                //
                // if (header.column !== _sort.field) {
                //   _sort.field = header.column;
                //   _sort.direction = GRID_SORT_DIRECTION.ACS;
                // } else {
                //   _sort.direction = _sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : _sort.type = GRID_SORT_DIRECTION.ACS;
                // }
                //
                // actions.setGridSortOrder(_sort);
                // this.markSorting(_sort.field, _sort.direction);
            },
            onItemDblClick(id) {
                // const item = this.getItem(id);
                // if (item && item.Id) {
                //   const notifUuid = location.search.split('notification=')[1];
                //   actions.goToTask(item.Id, notifUuid);
                // }
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
