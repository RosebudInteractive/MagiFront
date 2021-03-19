import React, {useEffect, useMemo, useRef, useState} from "react"
import Webix from "../../Webix";
import "./process-elements-grid.sass"
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import $ from "jquery";
import {getState} from "../../../tools/elements";
import ElementEditor from "./editor";

type ProcessElementsGridProps = {
    values: Array,
    elements: Array,
    editors: Array,
    onDelete: Function,
    onUpdate: Function,
    onAdd: Function,
}

export default function ProcessElementsGrid(props: ProcessElementsGridProps) {
    const {onDelete, values, editors} = props

    const [editorVisible, setEditorVisible] = useState(false)
    const [currentElement, setCurrentElement] = useState(null)
    const [myValues, setValues] = useState([])
    const [sort, setSort] = useState({field: null, direction: null})
    const [elementInEditMode, setElementInEditMode] = useState(false)


    useEffect(() => {
        $(window).on('resize', resizeHandler);
        resizeHandler();

        return () => {
            $(window).unbind('resize', resizeHandler)
        }
    })

    useEffect(() => {
        if (values && Array.isArray(values)) {
            let _elements = values.map((item) => {
                return {
                    Id: item.Id,
                    Name: item.Name,
                    State: item.State,
                    SupervisorId: item.Supervisor && item.Supervisor.Id,
                }
            })

            setValues(_elements)
        }
    }, [values])

    const _id = useRef(props.id ? props.id : "ui-processes-grid_" + Math.floor(Math.random() * Math.floor(10000))),
        _wrapperId = useRef("process-elements-grid_" + Math.floor(Math.random() * Math.floor(10000)))

    const resizeHandler = () => {
        const _wrapper = $(`#${_wrapperId.current}`),
            _width = _wrapper.width()

        if (window.$$(_id.current)) {
            const _height = window.$$(_id.current).$height

            window.$$(_id.current).$setSize(_width, _height + 40)
        }
    }

    const sortValues = () => {
        let _values = values
        if (sort.field) {
            _values = _values.sort((itemA, itemB) => {
                return sort.direction === GRID_SORT_DIRECTION.ACS ? itemA[sort.field] - itemB[sort.field] : itemB[sort.field] - itemA[sort.field]
            })
        }

        setValues(_values)
    }

    useEffect(() => {
        // sortValues()
    }, [sort,])

    const _getEditors = () => {
        return editors && editors.map((item) => { return {id: item.Id, value: item.DisplayName}})
    }

    const GRID_CONFIG = useRef({
            view: "datatable",
            id: _id.current,
            css: 'tt-element-grid',
            hover: "row-hover",
            scroll: 'none',
            headerRowHeight: 40,
            rowHeight: 49,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                {id: 'Name', header: 'Название элемента', fillspace: 80, width: 100,},
                {id: 'SupervisorId', header: 'Ответственный', fillspace: 30, width: 105, options: _getEditors()},
                {
                    id: 'State', header: 'Статус', width: 130,
                    template: function (data) {
                        const _data = getState(data.State)
                        return `<div class="process-element__state ${_data.css}">${_data.caption}</div>`
                    }
                },
                {
                    id: "",
                    template: "<button class='process-elements-grid__button elem-edit'/>",
                    width: 40
                },
                {
                    id: "",
                    template: "<button class='process-elements-grid__button elem-delete'/>",
                    width: 40
                }
            ],
            on: {
                onHeaderClick: function (header,) {
                    const newSort = {...sort}

                    if (header.column !== sort.field) {
                        newSort.field = header.column
                        newSort.direction = GRID_SORT_DIRECTION.ACS
                    } else {
                        newSort.direction = sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : GRID_SORT_DIRECTION.ACS
                    }
                    setSort(newSort)
                    this.markSorting(newSort.field, newSort.direction)
                },
            },
            onClick: {
                "elem-delete": function(e, data) {
                    const item = this.getItem(data.row)
                    if (item) {
                        setCurrentElement(item)
                        setEditorVisible(true)
                    }
                },
                "elem-edit": function(e, data) {
                    const item = this.getItem(data.row)
                    if (item) {
                        setCurrentElement(item)
                        setElementInEditMode(true)
                        setEditorVisible(true)
                    }
                }
            }
        }
    )

    const onAddElement = () => {
        setCurrentElement({Name: null, SupervisorId: null, State: null})
        setElementInEditMode(false)
        setEditorVisible(true)
    }

    const onApply = (value) => {
        console.log(value)
    }

    const closeEditor = () => {
        setEditorVisible(false)
    }



    return <div className="process-elements-grid" id={_wrapperId.current}>
        <div className="grid-wrapper">
            <Webix ui={GRID_CONFIG.current} data={myValues}/>
        </div>
        <button className="process-page__save-button orange-button small-button" onClick={onAddElement}>
            Новый элемент
        </button>
        {editorVisible && <ElementEditor editors={editors} value={currentElement} editMode={elementInEditMode} onApply={onApply} onClose={closeEditor}/>}
    </div>
}

