import React, {useRef, useState} from "react"
import Webix from "../../Webix";
import {GRID_SORT_DIRECTION} from "../../../constants/common";

export default function ProcessElementsGrid(props) {
    const {input, meta} = props

    const [editorVisible, setEditorVisible] = useState(false)
    const [currentElement, setCurrentElement] = useState(null)

    const _sortRef = useRef({field: null, direction: null})

    const _id = props.id ? props.id : "ui-processes-grid_" + Math.floor(Math.random() * Math.floor(10000))

    const GRID_CONFIG = {
        view: "datatable",
        id: _id,
        css: 'tt-element-grid',
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

                this.markSorting(_sort.field, _sort.direction)
            },
            onItemClick: function (id) {
                const item = this.getItem(id)
                if (item && item.Id) {
                    setCurrentElement(item)
                    setEditorVisible(true)
                }
            }
        }
    };

    return <div className="process-elements-grid">
        <div className="grid-container">
            <Webix ui={GRID_CONFIG} data={processes}/>
        </div>
    </div>
}
