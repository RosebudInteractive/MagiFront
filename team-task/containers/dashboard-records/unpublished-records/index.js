import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './unpublished-records.sass'
import Webix from "../../../components/Webix";
import {getFilterConfig, grid2grid, resizeHandler} from "./functions";
import type {FilterField} from "../../../components/filter/types";
import {useWindowSize} from "../../../tools/window-resize-hook";
import {
    courseOptionsUnpublishedFilter,
    elementsFieldSetSelector,
    fetchingSelector,
    getDashboardUnpublishedLessons,
    getUnpublishedRecords,
    setFilterUnpublished,
    setPublishRecordDate,
    unpublishedLessons
} from "tt-ducks/dashboard-records";
import {hideSideBarMenu, showSideBarMenu} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {applyFilter, setGridSortOrder, setGridSortOrderSilently, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import FilterRow from "../../../components/filter";
import $ from "jquery";
import {hasAdminRights} from "tt-ducks/auth";
import type {GridSortOrder} from "../../../types/grid";
import {GRID_SORT_DIRECTION} from "../../../constants/common";

let unpublishedCount = 0;

function UnpublishedRecords(props) {
    const {unpublishedRecords, actions, courses, hasAdminRights} = props;
    const [visible, setVisible] = useState(false);
    const [stateChanger, setChanger] = useState(true);

    const handleScroll = () => {
        const input = $('.unpublished-records__grid-panel ._autocomplete.rs-picker-input');
        const inputScrollPosY = input[0].getBoundingClientRect().y;
        $('.rs-picker-menu.CourseNameUnpublished-name-id').css({position: 'fixed', top: `${inputScrollPosY + input.outerHeight()}px`});
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, {passive: true});

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const _onResize = useCallback(() => {
        resizeHandler(unpublishedCount)
    }, [unpublishedCount]);

    const _sortRef = useRef({field: null, direction: null}),
    filter = useRef(null),
    filterAndOrderRef = useRef(null);

    // useEffect(() => {
    //
    // }, [])

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
        props.resizeTriggerFn(visible);

        if (visible) {
            setTimeout(_onResize, 300);
        }
    }, [visible]);

    const GRID_CONFIG = useMemo(() => {

        const config = {
            view: "datatable",
            id: 'unpublished-records-grid-table',
            css: 'tt-element-grid',
            hover: "row-hover",
            scroll: "none",
            headerRowHeight: 40,
            rowHeight: 49,
            select: true,
            editable: false,
            externalData: grid2grid,
            columns: [
                {id: 'Id', header: 'Id', hidden: true},
                {
                    id: 'CourseLessonName', header: `<div class="doubled-aligned">Курс <br/>Лекция</div>`,
                    css: '_container doubled-ceil',
                    fillspace: 75,
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
                {id: 'CourseName', hidden: true, header: [{text: 'Курс'}]},
                {
                    id: 'LessonNum', header: [{text: 'Номер', css: 'centered-by-flex'}], fillspace: 25, css: "_container", template: function (val) {
                        return `<div class="centered-by-flex">${val.LessonNum}</div>`;
                    }
                },
                {
                    id: 'LessonName',
                    hidden: true,
                    header: [{text: 'Лекция', css: {'text-align': 'center'}}],
                },
            ],
            on: {
                onHeaderClick: function (header) {
                    const _sort: GridSortOrder = _sortRef.current;

                    let paramsObject = {};

                    if(filterAndOrderRef.current){
                        paramsObject = filterAndOrderRef.current
                    }

                    if (header.column !== _sort.field) {
                        _sort.field = header.column
                        _sort.direction = GRID_SORT_DIRECTION.ACS
                    } else {
                        _sort.direction = _sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : _sort.type = GRID_SORT_DIRECTION.ACS
                    }

                    const sortMark = {..._sort};

                    if(_sort.field === 'CourseLessonName'){
                        _sort.field = 'LessonName'
                    }

                    if(_sort.field === 'LessonNum'){
                        _sort.field = 'Number'
                    }

                    paramsObject.order = _sort.direction === GRID_SORT_DIRECTION.ACS ? _sort.field : `${_sort.field},${_sort.direction}`;

                    actions.setGridSortOrderSilently(_sort);
                    _sortRef.current = sortMark;

                    actions.getUnpublishedRecords($.param(paramsObject));
                    actions.getDashboardUnpublishedLessons();
                    this.markSorting(sortMark.field, sortMark.direction);
                },
                onBeforeDragIn: function (context, e) {
                    return hasAdminRights;
                },
            },
            onClick: {},
            "elem-edit": function (e, data) {
                if (props.disabled) return
            }
        }

        if (hasAdminRights) {
            config.drag = 'move'
        }

        return config;
    }, [hasAdminRights]);

    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {

        const uniqCourseIds = [...new Set(courses.map(record => record.Id))];

        const courseOptions = (courses && courses.length > 0) ?
            uniqCourseIds.map(uniqId => {
                const unpublishedRecord = courses.find(record => record.Id === uniqId);
                return {
                    value: unpublishedRecord.Name,
                    label: unpublishedRecord.Name
                }
            }) : [];

        return getFilterConfig(filter.current, [], {courseOptions});
    }, [courses]);

    const _onApplyFilter = (filterData) => {

        filter.current = filterData;
        const filterToRequest = {};

        if (filterData) {
            filterToRequest.course_name = filterData.CourseNameUnpublished;
            filterToRequest.lesson_name = filterData.LessonNameUnpublished;

            if(filterData.ShowLesson !== undefined){
                filterToRequest.showLesson = filterData.ShowLesson;
            }

            if(filterData.ShowSubLesson !== undefined){
                filterToRequest.showSubLesson = filterData.ShowSubLesson;
            }

        }

        filterAndOrderRef.current = filterToRequest;

        if(!filterData){
            _sortRef.current = {field: null, direction: null};
            filterAndOrderRef.current = null;
        }

        actions.getUnpublishedRecords($.param(filterToRequest));
        actions.getDashboardUnpublishedLessons();
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
                           onChangeField={onChangeFieldCb}
                           disableDefaultWidthBasis={true}/>
            </div>
            <div className={'webix-datatable js-unpublished _with-custom-scroll'}>
                <div className={'webix-datatable-wrapper'}>
                    <Webix ui={GRID_CONFIG} data={unpublishedRecords}/>
                </div>
            </div>
        </div>
        <div className="elements__hide-button" onClick={toggleVisible}/>
    </div>)
}

const mapState2Props = (state) => {
    return {
        fetching: fetchingSelector(state),
        elementsFieldSet: elementsFieldSetSelector(state),
        courses: courseOptionsUnpublishedFilter(state),
        allUnpublishedRecords: unpublishedLessons(state),
        hasAdminRights: hasAdminRights(state),
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
            getDashboardUnpublishedLessons,
            setGridSortOrderSilently
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(UnpublishedRecords)
