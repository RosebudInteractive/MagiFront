import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {Field, Form} from "react-final-form";
import {TextBox} from "../../../../ui-kit";
import {EVENT_STATES} from "../../../../../constants/events";
import {useWindowSize} from "../../../../../tools/window-resize-hook";
import {resizeHandler} from "../../../../../tools/resize-handler";
import Webix from "../../../../Webix";

import './period-find-form.sass'


let findedPeriodsCount = 0;

export default function PeriodsFindForm(props) {
    const {findedData, addPeriodsAction, findAction} = props;
    const selectedPeriods = useRef([]);

    useWindowSize(() => {
        resizeHandler(findedPeriodsCount, "#found-periods-container", 'periods-find-form');
    });

    useEffect(() => {
        findedPeriodsCount = findedData ? findedData.length : findedPeriodsCount;
        _onResize();
    }, [findedData]);

    const _onResize = useCallback(() => {
        resizeHandler(findedPeriodsCount, "#found-periods-container", 'periods-find-form')
    }, [findedData]);

    const GRID_CONFIG = {
        view: "datatable",
        id: `periods-find-form-grid`,
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
                id: 'DisplayStartDate', header: 'Дата начала', minWidth: 100, fillspace: 20
            },
            {
                id: 'DisplayEndDate', header: 'Дата конца', minWidth: 100, fillspace: 20
            },
            {
                id: 'State', header: 'Состояние', minWidth: 100, fillspace: 20,
                options: EVENT_STATES //
            },
        ],
        on: {
            onSelectChange: function (data) {
                const selectedRowIds = this.getSelectedId(true).map(sl => sl.id);
                selectedPeriods.current = selectedRowIds.map(slId => this.getItem(slId).Id);
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

    const _onSearchClick = (values) => {
        // const value = values;
        findAction(values);
    }

    const _onAddButtonClick = () => {
        if (selectedPeriods.current.length > 0) {
            addPeriodsAction(selectedPeriods.current)
        }
    }

    return (
        <div className="periods-find-form">
            <Form
                initialValues={searchFormData}
                onSubmit={values => {
                }}
                validate={values => {
                }}
                subscription={{values: true, pristine: true}}
                render={({searchForm, submitting, pristine, values}) => (
                    <form onSubmit={e => {
                        e.preventDefault()
                    }}>
                        <div className='periods-find-form__field'>
                            <Field name="Name"
                                   component={TextBox}
                                   type="text"
                                   placeholder="Название"
                                   label={"Название"}

                                   disabled={false}/>

                        </div>
                        <div>
                            <div className="periods-find-form-date">
                                <div className="periods-find-form__field">
                                    <Field name="Day"
                                           component={TextBox}
                                           type="number"
                                           placeholder="День"
                                           label={"День"}/>
                                </div>

                                <div className="periods-find-form__field">
                                    <Field name="Month"
                                           type="number"
                                           component={TextBox}
                                           type="text"
                                           placeholder="Месяц"
                                           label={"Месяц"}

                                           disabled={false}/>
                                </div>

                                <div className="periods-find-form__field">
                                    <Field name="Year"
                                           component={TextBox}
                                           type="text"
                                           placeholder="Год"
                                           label={"Год"}

                                           disabled={false}/>
                                </div>

                                <button type="button" className='search-button' onClick={() => {
                                    _onSearchClick(values)
                                }}>
                                    Поиск
                                </button>
                            </div>
                        </div>



                        {/*</div>*/}
                    </form>)}/>
            <div className="grid-container__wrapper">
                <div className="grid-container finded-periods-table unselectable" id="found-periods-container">
                    <Webix ui={GRID_CONFIG} data={findedData}/>
                </div>
            </div>
            <button type="button" className="orange-button big-button add-selected" onClick={_onAddButtonClick}>
                Добавить
            </button>
        </div>
    )
}
