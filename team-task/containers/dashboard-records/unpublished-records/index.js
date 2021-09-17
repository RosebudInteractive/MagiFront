import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './unpublished-records.sass'
import Webix from "../../../components/Webix";
import {getFilterConfig, resizeHandler, showColumn} from "./functions";
import type {FilterField} from "../../../components/filter/types";
import {useWindowSize} from "../../../tools/window-resize-hook";
import {
    allUnpublishedRecordsSelector,
    elementsFieldSetSelector,
    fetchingSelector,
    getUnpublishedRecords,
    setPublishRecordDate
} from "tt-ducks/dashboard-records";
import {hideSideBarMenu, showSideBarMenu} from "tt-ducks/app";
import {coursesSelector} from "tt-ducks/dictionary";
import {bindActionCreators} from "redux";
import {applyFilter, filterSelector, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import FilterRow from "../../../components/filter";
import $ from "jquery";


let unpublishedCount = 0;

function UnpublishedRecords(props) {
    const {unpublishedRecords, actions, allUnpublishedRecords} = props;
    const [visible, setVisible] = useState(false);
    const [stateChanger, setChanger] = useState(true);

    const _onResize = useCallback(() => {
        resizeHandler(unpublishedCount)
    }, [unpublishedCount]);

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(unpublishedCount)
    });

    useEffect(() => {
        unpublishedCount = unpublishedRecords.length;
    }, [unpublishedRecords]);

    const toggleVisible = () => {
        setVisible(!visible);

        setTimeout(() => {
            $(window).trigger('toggle-elements-visible');
            resizeHandler();
        }, 210)
    };

    useEffect(() => {
        if (visible) {
            // hideColumn('processElements', {spans: true});
        } else {
            showColumn('processElements', {spans: true});
        }

        props.resizeTriggerFn(visible);
    }, [visible]);

    useEffect(() => {
        if (unpublishedRecords && unpublishedRecords.length > 0) {
        }
    }, [unpublishedRecords]);

    const GRID_CONFIG = {
        view: "datatable",
        id: 'unpublished-records-grid-table',
        css: 'tt-element-grid _height-85',
        hover: "row-hover",
        scroll: "y",
        headerRowHeight: 40,
        rowHeight: 49,
        autoheight: true,
        select: true,
        editable: false,
        drag: "move",
        columns: [
            {id: 'Id', header: 'Id', hidden: true},
            {id: 'CourseName', header: [{text: 'Курс'}], fillspace: 40},
            {
                id: 'LessonNum', header: 'Номер', fillspace: 20, css: "_container", template: function (val) {
                    return `<div class="centered-by-flex">${val.LessonNum}</div>`;
                }
            },
            {id: 'LessonName', header: [{text: 'Лекция', css: {'text-align': 'center'}}], fillspace: 40},
        ],
        on: {
            onHeaderClick: function () {
            },
        },
        onClick: {
        },
        "elem-edit": function (e, data) {
            if (props.disabled) return
        }
    };


    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {

        const selectedRecordByCourse = filter.current ?
            allUnpublishedRecords.find(record => record.CourseName === filter.current.CourseNameUnpublished) : null;
        const uniqCourseIds = [...new Set(allUnpublishedRecords.map(record => record.CourseId))];

        const courseOptions = (allUnpublishedRecords && allUnpublishedRecords.length > 0) ?
            uniqCourseIds.map(uniqId => {
                const unpublishedRecord = allUnpublishedRecords.find(record => record.CourseId === uniqId);
                return {
                    value: unpublishedRecord.CourseName,
                    label: unpublishedRecord.CourseName
                }
            }) : [];

        const lessonOptions = (allUnpublishedRecords && allUnpublishedRecords.length > 0) ?
            allUnpublishedRecords.filter(record => selectedRecordByCourse ?
                record.CourseId === selectedRecordByCourse.CourseId : true).map(c => ({
                value: c.LessonName,
                label: c.LessonName
            })) : [];

        return getFilterConfig(filter.current, [], {courseOptions, lessonOptions});
    }, [filter.current, allUnpublishedRecords]);

    const _onApplyFilter = (filterData) => {

        filter.current = filterData;
        const filterToRequest = {};

        if (filterData) {
            filterToRequest.course_name = filterData.CourseNameUnpublished;
            filterToRequest.lesson_name = filterData.LessonNameUnpublished;
        }

        // actions.applyFilterSilently(filterData);
        actions.getUnpublishedRecords({filterOn: true, params: $.param(filterToRequest)});
        actions.getUnpublishedRecords({filterOn: false});
    };

    const onChangeFieldCb = ({name, value}) => {
        if (name === 'CourseNameUnpublished') {
            console.log('it changed but what?')
            const newFilterValues = {...filter.current, CourseNameUnpublished: value};

            // allUnpublishedRecords.filter(record => record.CourseName == );
            newFilterValues.hasOwnProperty('LessonNameUnpublished') && delete newFilterValues['LessonNameUnpublished'];
            filter.current = newFilterValues;
            setChanger(!stateChanger);
        }
    };

    return (<div className={"unpublished-records-block" + (!visible ? " _hidden" : "")}>
        <div className="unpublished-records-wrapper">

            <h6 className="title _grey100">Неопубликованные лекции</h6>
            <div className="unpublished-records-grid">
                <div className="somediv">

                    <div className="filters">
                        <FilterRow fields={FILTER_CONFIG}
                                   onApply={_onApplyFilter}
                                   onChangeVisibility={_onResize}
                                   onChangeField={onChangeFieldCb}/>
                    </div>
                    <Webix ui={GRID_CONFIG} data={unpublishedRecords}/>
                </div>

                <div className="elements__hide-button" onClick={toggleVisible}/>
            </div>

        </div>

    </div>)
}

const mapState2Props = (state) => {
    return {
        fetching: fetchingSelector(state),
        elementsFieldSet: elementsFieldSetSelector(state),
        courses: coursesSelector(state),
        filterSelector: filterSelector(state),
        allUnpublishedRecords: allUnpublishedRecordsSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            hideSideBarMenu, showSideBarMenu,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            setPublishRecordDate,
            getUnpublishedRecords
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(UnpublishedRecords)
