import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './unpublished-records.sass'
import Webix from "../../../components/Webix";
import {getFilterConfig, grid2grid, resizeHandler, showColumn} from "./functions";
import type {FilterField} from "../../../components/filter/types";
import {useWindowSize} from "../../../tools/window-resize-hook";
import {
    elementsFieldSetSelector,
    fetchingSelector,
    getUnpublishedRecords,
    setFilterUnpublished,
    setPublishRecordDate
} from "tt-ducks/dashboard-records";
import {hideSideBarMenu, showSideBarMenu} from "tt-ducks/app";
import {coursesSelector, getDashboardUnpublishedRecords, unpublishedLessons} from "tt-ducks/dictionary";
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

    const handleScroll = () => {
        const input = $('.unpublished-records__grid-panel ._autocomplete.rs-picker-input');
        const inputScrollPosY = input[0].getBoundingClientRect().y;
        $('.rs-picker-menu.CourseNameUnpublished-name-id').css({position: 'fixed', top: `${inputScrollPosY + input.outerHeight()}px`});
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
        (!visible) && showColumn('processElements', {spans: true});

        props.resizeTriggerFn(visible);
    }, [visible]);

    const GRID_CONFIG = {
        view: "datatable",
        id: 'unpublished-records-grid-table',
        css: 'tt-element-grid',
        hover: "row-hover",
        scroll: "none",
        headerRowHeight: 40,
        rowHeight: 49,
        select: true,
        editable: false,
        drag: "move",
        externalData: grid2grid,
        columns: [
            {id: 'Id', header: 'Id', hidden: true},
            {
                id: 'CourseLessonName', header: `<div class="doubled-aligned">Курс <br/>Лекция</div>`,
                css: '_container doubled-ceil',
                fillspace: 80,
                template: function (data) {
                    return `<div  class="course-lesson-name-ceil">
                        <div class="course-name">
                            ${data.CourseName}                   
                        </div>
                        <div class="lesson-name">
                            ${data.LessonName}       
                        </div>
                   </div>`
                }
            },
            {id: 'CourseName', hidden: true, header: [{text: 'Курс'}], fillspace: 40},
            {
                id: 'LessonNum', header: 'Номер', fillspace: 20, css: "_container", template: function (val) {
                    return `<div class="centered-by-flex">${val.LessonNum}</div>`;
                }
            },
            {id: 'LessonName', hidden: true, header: [{text: 'Лекция', css: {'text-align': 'center'}}], fillspace: 40},
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

        actions.getUnpublishedRecords($.param(filterToRequest));
        actions.getDashboardUnpublishedRecords();
    };

    const onChangeFieldCb = ({name, value}) => {
        actions.setFilterUnpublished($.param({course_name: value}));

        if (name === 'CourseNameUnpublished') {
            const newFilterValues = {...filter.current, CourseNameUnpublished: value};
            newFilterValues.hasOwnProperty('LessonNameUnpublished') && delete newFilterValues['LessonNameUnpublished'];
            filter.current = newFilterValues;
            setChanger(!stateChanger);
        }
    };


    return (<div className={"unpublished-records-block" + (!visible ? " _hidden" : "")}>
            <h6 className="title _grey100">Неопубликованные лекции</h6>
                <div className="unpublished-records__grid-panel ">
                    <div className="filters">
                        <FilterRow fields={FILTER_CONFIG}
                                   onApply={_onApplyFilter}
                                   onChangeVisibility={_onResize}
                                   onChangeField={onChangeFieldCb}/>
                    </div>
                    <div className={'webix-datatable js-unpublished _with-custom-scroll'}>
                        <Webix ui={GRID_CONFIG} data={unpublishedRecords}/>
                    </div>
                </div>
        <div className="elements__hide-button" onClick={toggleVisible}/>
    </div>)
}

const mapState2Props = (state) => {
    return {
        fetching: fetchingSelector(state),
        elementsFieldSet: elementsFieldSetSelector(state),
        courses: coursesSelector(state),
        filterSelector: filterSelector(state),
        allUnpublishedRecords: unpublishedLessons(state),
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
            getUnpublishedRecords,
            setFilterUnpublished,
            getDashboardUnpublishedRecords
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(UnpublishedRecords)
