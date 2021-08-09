import React, {useEffect, useMemo, useRef} from "react";
import {Field, Form} from "react-final-form";
import {TextBox} from "../../ui-kit";
import {EVENT_STATES} from "../../../constants/events";
import {useWindowSize} from "../../../tools/window-resize-hook";
import {resizeHandler} from "../../../tools/resize-handler";
import Webix from "../../Webix";

import './event-find-form.sass'

let eventsCount = 0

export default function EventsFindForm(props) {
    const {findedData, addEventsAction, findAction, closeAction} = props;
    const selectedEvents = useRef([]);

    useWindowSize(() => {
        resizeHandler(eventsCount, "#found-events-container", 'events-find-form');
    });

    useEffect(() => {
        eventsCount = findedData ? findedData.length : 0
        resizeHandler(eventsCount, "#found-events-container",'events-find-form')
    }, [findedData]);

    const GRID_CONFIG = {
        view: "datatable",
        id: `events-find-form-grid`,
        css: 'tt-grid',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 20,
        height: 450,
        rowHeight: 40,
        select: "row",
        multiselect: true,
        editable: false,
        columns: [
            {id: 'Id', header: 'Id', hidden: true},
            {id: 'Name', header: 'Название', minWidth: 100, fillspace: 20},
            {id: 'ShortName', header: 'Краткое название', minWidth: 100, fillspace: 20},
            {id: 'Description', header: 'Описание', minWidth: 100, fillspace: 20},
            {
                id: 'Date', header: 'Дата события', minWidth: 100, fillspace: 20, format: function (value) {
                    let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                    return value ? fn(new Date(value)) : '';
                }
            },
            {
                id: 'State', header: 'Состояние', minWidth: 100, fillspace: 20,
                options: EVENT_STATES
            },
        ],
        on: {
            onSelectChange: function (data) {
                const selectedRowIds = this.getSelectedId(true).map(sl => sl.id);
                selectedEvents.current = selectedRowIds.map(slId => this.getItem(slId).Id);
            },
            onHeaderClick: function (header) {
                // actions.headerClick();
                // todo headerClick
            },
            onItemDblClick: function (id) {
                // actions.doubleClickAction(item.Id); // todo onItemDblClick
            }
        },
        onClick: {
            "elem-delete": function (e, data) {
                // actions.deleteAction();
                // todo delete action
                e.preventDefault()
            }
        },
    };

    const searchFormData = useMemo(() => {
        return {
            Name: '',
            Year: '',
            Month: '',
            Day: '',
        }
    });

    return (
        <div className="events-find-form">
            <Form
                initialValues={searchFormData}
                onSubmit={values => {}}
                validate={values => {}}
                subscription={{values: true, pristine: true}}
                render={({searchForm, submitting, pristine, values}) => (
                    <form onSubmit={e => {
                        e.preventDefault();
                    }}>
                        <div className='events-find-form__field'>
                            <Field name="Name"
                                   component={TextBox}
                                   type="text"
                                   placeholder="Название"
                                   label={"Название"}

                                   disabled={false}/>
                        </div>

                        <div className="events-find-form-date">
                            <div className='events-find-form__field'>
                                <Field name="Day"
                                       component={TextBox}
                                       type="number"
                                       placeholder="День"
                                       label={"День"}

                                       disabled={false}/>
                            </div>

                            <div className='events-find-form__field'>
                                <Field name="Month"
                                       type="number"
                                       component={TextBox}
                                       type="text"
                                       placeholder="Месяц"
                                       label={"Месяц"}
                                       disabled={false}/>
                            </div>

                            <div className='events-find-form__field'>
                                <Field name="Year"
                                       component={TextBox}
                                       type="text"
                                       placeholder="Год"
                                       label={"Год"}

                                       disabled={false}/>
                            </div>

                            <button disabled={false} type="button" className='search-button' onClick={() => {
                                findAction(values);
                            }}>
                                Поиск
                            </button>
                        </div>

                        {/*</div>*/}
                    </form>)}/>


            <div className="grid-container__wrapper">
                <div className="grid-container found-events-table unselectable _with-custom-scroll" id="found-events-container">
                    <Webix ui={GRID_CONFIG} data={findedData}/>
                </div>
            </div>

            <button disabled={false} type="button" className="orange-button big-button add-selected" onClick={() => {
                if (selectedEvents.current.length > 0) {
                    addEventsAction(selectedEvents.current)
                }
            }}>
                Добавить
            </button>
        </div>
    )
}
