import {GRID_SORT_DIRECTION} from "../../../constants/common";

export default const GRID_CONFIG = {
    view: "datatable",
    id: 'processes-grid',
    css: 'tt-grid',
    hover:"row-hover",
    scroll: 'none',
    headerRowHeight: 40,
    rowHeight: 72,
    height: 500,
    select: true,
    editable: false,
    columns: [
        {id: 'Name', header: 'Название элемента', fillspace: 30, width: 100, format: function(value) {
                let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                return value ? fn(new Date(value)) : '';
            }},
        {id: 'SupervisorId', header: 'Ответственный', width: 105},
        {
            id: 'State', header: 'Статус', width: 150,
            template: function(data) {
                return `<div class="element-state ${data.css}">${data.label}</div>`
            }
        },
    ],
    on: {
        onHeaderClick: function(header,) {
            const _sort = _sortRef.current

            if (header.column !== _sort.field) {
                _sort.field = header.column
                _sort.direction = GRID_SORT_DIRECTION.ACS
            } else {
                _sort.direction = _sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : GRID_SORT_DIRECTION.ACS
            }

            actions.setGridSortOrder(_sort)
            this.markSorting(_sort.field, _sort.direction)
        },
        onItemClick: function (id) {
            const item = this.getItem(id)
            if (item && item.Id) {
                actions.goToProcess(item.Id)
            }
        }
    }
};
