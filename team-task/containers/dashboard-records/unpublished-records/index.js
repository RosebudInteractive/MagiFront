import React, {useEffect, useState} from 'react';
import './unpublished-records.sass'
import Webix from "../../../components/Webix";
import {resizeHandler} from "./functions";

function UnpublishedRecords(props) {
    const {unpublishedRecords} = props;
    const [visible, setVisible] = useState(false);

    const toggleVisible = () => {
        setVisible(!visible);

        setTimeout(() => {
            $(window).trigger('toggle-elements-visible');
            resizeHandler();
        }, 210)
    };

    useEffect(() => {
        props.resizeTriggerFn(visible);
    }, [visible]);

    useEffect(() => {
        if(unpublishedRecords && unpublishedRecords.length > 0){
            console.log('it recirevec!!!!!!!!!!!!1!!!!')
        }
    }, [unpublishedRecords]);

    const GRID_CONFIG = {
        view: "datatable",
        id: 'unpublished-records-grid-table',
        css: 'tt-element-grid',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 49,
        autoheight: true,
        select: true,
        editable: false,
        drag: "source",
        scheme:{
            // $change: getActiveRow
        },
        columns: [
            {id: 'Id', header: 'Id', hidden: true },
            {id: 'CourseName', header: 'Курс', fillspace: 30, width: 80},
            {id: 'LessonName', header: 'Лекция', fillspace: 30, width: 80},
            {id: 'LessonNum', header: 'Номер', fillspace: 30, width: 80},
            // {
            //     id: 'State', header: 'Статус', width: 55,
            //     template: function (data) {
            //         const _data = getState(data.State)
            //         return `<div class="process-element__state ${_data.css}"></div>`
            //     }
            // },
            // {
            //     id: "",
            //     template: "<button class='process-elements-grid__button elem-edit'/>",
            //     width: 24
            // },
            // {
            //     id: "",
            //     template: "<button class='process-elements-grid__button elem-delete'/>",
            //     width: 24
            // }
        ],
        on: {
            onHeaderClick: function () {
                // const oldSort = _gridData.current.data.sort,
                //     newSort = {...oldSort}
                //
                // if (header.column !== oldSort.field) {
                //     newSort.field = header.column
                //     newSort.direction = GRID_SORT_DIRECTION.ACS
                // } else {
                //     newSort.direction = oldSort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : GRID_SORT_DIRECTION.ACS
                // }
                // // setSort(newSort)
                // this.markSorting(newSort.field, newSort.direction)
            },
        },
        onClick: {
            "elem-delete": function (e, data) {
                if (props.disabled) return

                const item = this.getItem(data.row)
                // if (item && onDelete) {
                    // onDelete(item.Id)
                }
            },
            "elem-edit": function (e, data) {
                if (props.disabled) return

                const item = this.getItem(data.row)
                if (item) {
                    // setCurrentElement(item)
                    // setElementsForEditor(elements)
                    // setElementInEditMode(true)
                    // setEditorVisible(true)
                }
            }
    }

    return (<div className={"unpublished-records-block" + (!visible ? " _hidden" : "")}>
        <div className="unpublished-records-wrapper">

            <h6 className="title _grey100">Неопубликованные лекции</h6>
                <div className="unpublished-records-grid">
                    <div className="somediv">
                        <Webix ui={GRID_CONFIG} data={unpublishedRecords}/>
                    </div>

                    <div className="elements__hide-button" onClick={toggleVisible}/>
                </div>

        </div>

    </div>)
}

export default UnpublishedRecords;
