import React, {useEffect, useMemo, useRef, useState} from "react"
import Webix from "../../Webix";
import "./process-elements-grid.sass"
import {GRID_SORT_DIRECTION} from "#src/constants/common";
import $ from "jquery";
import {getState} from "#src/tools/elements";
import ElementEditor from "./editor";

// type ProcessElementsGridProps = {
//     values: Array,
//     activeElementId: number,
//     elements: Array,
//     editors: Array,
//     onDelete: Function,
//     onUpdate: Function,
//     onAdd: Function,
//     disabled: boolean,
// }

class GridData {
    constructor() {
        this.data = {}
    }

    setData(data) {
        this.data = {...data}
    }
}

// export default function ProcessElementsGrid(props: ProcessElementsGridProps) {
export default function ProcessElementsGrid(props) {
    const {onDelete, onAdd, onUpdate, values, editors, elements,} = props

    const [editorVisible, setEditorVisible] = useState(false)
    const [currentElement, setCurrentElement] = useState(null)
    const [myValues, setMyValues] = useState([])
    const [render, setRender] = useState(false)
    const [sort, setSort] = useState({field: null, direction: null})
    const [elementInEditMode, setElementInEditMode] = useState(false)
    const [elementsForEditor, setElementsForEditor] = useState(false)

    const _gridData = useRef(new GridData())

    const allElementsInValues = useMemo(() => {
        const _allValuesInElements = values.every((value) => {
            return elements.find(element => element.Id === value.ElemId)
        })

        const _allElementsInValue = elements.every((element) => {
            return values.find(value => element.Id === value.ElemId)
        })

        return _allValuesInElements && _allElementsInValue
    }, [values])

    useEffect(() => {
        const _body = $("body")

        editorVisible ? _body.addClass("_no-vertical-scroll") : _body.removeClass("_no-vertical-scroll")
    }, [editorVisible])

    useEffect(() => {
        $(window).on('resize toggle-elements-visible', resizeHandler);
        setTimeout(resizeHandler, 300);

        return () => {
            $(window).unbind('resize toggle-elements-visible', resizeHandler)
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

            setMyValues(_elements)
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
        if (sort.field) {
            myValues.sort((itemA, itemB) => {
                return sort.direction === GRID_SORT_DIRECTION.ACS ?
                    itemA[sort.field] > itemB[sort.field] ? 1 : itemA[sort.field] < itemB[sort.field] ? -1 : 0
                    :
                    itemB[sort.field] > itemA[sort.field] ? 1 : itemB[sort.field] < itemA[sort.field] ? -1 : 0
            })
        }
    }

    useEffect(() => {
        sortValues()
    }, [sort,])

    const _getEditors = () => {
        return editors && editors.map((item) => {
            return {id: item.Id, value: item.DisplayName}
        })
    }

    const getActiveRow = (item) => {
        if (item.Id === _gridData.current.data.activeElementId) {
            item.$css = "_active"
        } else {
            item.$css = ""
        }
    }

    useEffect(() => {
        _gridData.current.setData({activeElementId: props.activeElementId, sort: sort})
        setRender(!render)
    }, [props.activeElementId, sort, myValues])

    const gridConfig = useRef({
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
            scheme:{
                $change: getActiveRow
            },
            columns: [
                {id: 'Name', header: '???????????????? ????????????????', fillspace: 40, width: 80,},
                {id: 'SupervisorId', header: '??????????????????????????', fillspace: 30, width: 80, options: _getEditors()},
                {
                    id: 'State', header: '????????????', width: 55,
                    template: function (data) {
                        const _data = getState(data.State)
                        return `<div class="process-element__state ${_data.css}"></div>`
                    }
                },
                {
                    id: "",
                    template: "<button class='process-elements-grid__button elem-edit'/>",
                    width: 24
                },
                {
                    id: "",
                    template: "<button class='process-elements-grid__button elem-delete'/>",
                    width: 24
                }
            ],
            on: {
                onHeaderClick: function (header,) {
                    const oldSort = _gridData.current.data.sort,
                        newSort = {...oldSort}

                    if (header.column !== oldSort.field) {
                        newSort.field = header.column
                        newSort.direction = GRID_SORT_DIRECTION.ACS
                    } else {
                        newSort.direction = oldSort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : GRID_SORT_DIRECTION.ACS
                    }
                    setSort(newSort)
                    this.markSorting(newSort.field, newSort.direction)
                },
            },
            onClick: {
                "elem-delete": function (e, data) {
                    if (props.disabled) return

                    const item = this.getItem(data.row)
                    if (item && onDelete) {
                        onDelete(item.Id)
                    }
                },
                "elem-edit": function (e, data) {
                    if (props.disabled) return

                    const item = this.getItem(data.row)
                    if (item) {
                        setCurrentElement(item)
                        setElementsForEditor(elements)
                        setElementInEditMode(true)
                        setEditorVisible(true)
                    }
                }
            }
        })

    const onAddElement = () => {
        const _elements = elements
            .map((element) => {
                return !(values && values.some(value => value.ElemId === element.Id)) && element
            })
            .filter(item => item)
        setElementsForEditor(_elements)
        setCurrentElement({Name: null, SupervisorId: null, State: 1});

        setElementInEditMode(false)
        setEditorVisible(true)
    }

    const onApply = (value) => {
        if (elementInEditMode) {
            onUpdate(value)
        } else {
            onAdd(value)
        }
    }

    const closeEditor = () => {
        setEditorVisible(false)
    }

    return <div className="process-elements-grid" id={_wrapperId.current}>
        <div className="grid-wrapper">
            <Webix ui={gridConfig.current} data={myValues}/>
        </div>
        <button className="process-page__save-button orange-button small-button" disabled={props.disabled || allElementsInValues}
                onClick={onAddElement}>
            ?????????? ??????????????
        </button>
        {
            editorVisible &&
            <ElementEditor value={currentElement}
                           editors={editors}
                           elements={elementsForEditor}
                           editMode={elementInEditMode}
                           onApply={onApply}
                           onClose={closeEditor}/>}
    </div>
}

