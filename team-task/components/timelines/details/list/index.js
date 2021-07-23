import React, {useCallback, useEffect} from "react";
import './details-list.sass'
import PlusIco from "tt-assets/svg/plus.svg";
import PlusOrangeIco from "tt-assets/svg/plus-orange.svg";
import Webix from "../../../Webix";
import {useWindowSize} from "../../../../tools/window-resize-hook";
import {resizeHandler} from "../../../../tools/resize-handler"

let _itemsCount = 0;

//todo finish this
export default function DetailsList(props) {
    const {actions, items, columnsConfig, idGrid, title, findedEl, addCompletelyCreated} = props;

    useWindowSize(() => {
        idGrid && resizeHandler(_itemsCount, idGrid)
    });

    useEffect(() => {
        _itemsCount = items.length;
        idGrid && resizeHandler(_itemsCount, idGrid);
        _onResize();
    }, [items, idGrid]);

    useEffect(() => {
        _onResize()

        setTimeout(_onResize, 300)

    }, [location]);

    const _onResize = useCallback(() => {
        resizeHandler(items.length, idGrid)
    }, [items]);

    const GRID_CONFIG = {
        view: "datatable",
        id: `${idGrid}-grid`,
        css: 'tt-grid',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 20,
        rowHeight: 40,
        height: 600,
        select: "row",
        multiselect: true,
        editable: false,
        columns: columnsConfig,
        on: {
            onHeaderClick: function (header) {
                // actions.headerClick();
                // todo headerClick
                // const _sort: GridSortOrder = _sortRef.current;
                //
                // if (header.column !== _sort.field) {
                //     _sort.field = header.column
                //     _sort.direction = GRID_SORT_DIRECTION.ACS
                // } else {
                //     _sort.direction = _sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : _sort.type = GRID_SORT_DIRECTION.ACS
                // }
                //
                // actions.setGridSortOrder(_sort);
                // this.markSorting(_sort.field, _sort.direction); //todo maybe use it later
            },
            onItemDblClick: function (id) {
                const item = this.getItem(id);
                actions.doubleClickAction(item.Id, id);
            }
        },
        onClick: {
            "elem-delete": function (e, data) {
                e.preventDefault();
                const item = this.getItem(data.row);
                actions.deleteAction(item.Id);
            }
        },
    };

    return (
        <div className="details-list">
            <div className='sticky-block'>
                <h5 className="form-header _grey70">{title ? title : 'Элементы'}</h5>
                <button className="open-form-button" onClick={actions.createAction}>
                    <PlusIco/>
                </button>
                <button className="open-form-button" onClick={actions.openFindFormAction} disabled={!addCompletelyCreated}>
                    <PlusOrangeIco/>
                </button>
            </div>
            <div className="grid-container__wrapper">
                <div className="grid-container details-list-table items-table js-resizeable-container unselectable">
                    <Webix ui={GRID_CONFIG} data={items}/>
                </div>
            </div>
        </div>
    )
}
