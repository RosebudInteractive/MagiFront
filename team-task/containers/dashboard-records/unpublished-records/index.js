import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import './unpublished-records.sass'
import Webix from "../../../components/Webix";
import {convertFilter2Params, getFilterConfig, resizeHandler, showColumn} from "./functions";
import type {FilterField} from "../../../components/filter/types";
// import {convertFilter2Params, getFilterConfig, parseParams, refreshColumns} from "../records-list/functions";
import {useWindowSize} from "../../../tools/window-resize-hook";
import {
    allUnpublishedRecordsSelector,
    elementsFieldSetSelector,
    fetchingSelector,
    getRecords,
    getUnpublishedRecords,
    setPublishRecordDate
} from "tt-ducks/dashboard-records";
import {hideSideBarMenu, showSideBarMenu} from "tt-ducks/app";
import {coursesSelector} from "tt-ducks/dictionary";
import {bindActionCreators} from "redux";
import {
    applyFilter,
    applyFilterSilently,
    filterSelector,
    setGridSortOrder,
    setInitState,
    setPathname
} from "tt-ducks/route";
import {connect} from "react-redux";
import FilterRow from "../../../components/filter";


let unpublishedCount = 0;

function UnpublishedRecords(props) {
    const {unpublishedRecords, actions, fetching, filterSelector, allUnpublishedRecords} = props;
    const [visible, setVisible] = useState(false);


    const location = useLocation();

    // const [columnFields, setColumnFields] = useState([...defaultColumnConfigOne, ...defaultColumnConfigTwo]);


    // const publishRecord = (re)
    // const droppedTar
    // const [set]

    const _onResize = useCallback(() => {
        resizeHandler(unpublishedCount)
    }, [unpublishedCount]);

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(unpublishedCount)
    });

    // useEffect(() => {
    //     console.log('resizeTrigger in records:', resizeTrigger);
    //
    // }, [resizeTrigger]);

    // useEffect(() => {
    // const additionalWidth = unpublishedPanelOpened ? 400 : 0;
    // resizeHandler(unpublishedCount); //add additional width here
    // }, [unpublishedPanelOpened, resizeTrigger]);

    // useEffect(() => {
    //     setColumnFields([...defaultColumnConfigOne, ...elementsFieldSet, ...defaultColumnConfigTwo]);
    // }, [elementsFieldSet]);

    // useEffect(() => {
    // refreshColumns(columnFields);
    // setTimeout(() => {
    //     _onResize();
    // }, 200);
    // }, [columnFields]);

    useEffect(() => {
        unpublishedCount = unpublishedRecords.length;
        console.log('unpublishedCount:', unpublishedCount)
        // if (sideBarMenuVisible) {
        //     _onResize();
        // } else {
        //     setTimeout(() => {
        //         _onResize();
        //     }, 200);
        // }
    }, [unpublishedRecords]);

    useEffect(() => {

        // const initState = parseParams({courseName: filterSelector.courseName, lessonName: filterSelector.lessonName});
        // if (initState.order) {
        //     _sortRef.current = initState.order;
        //     const _grid = window.webix.$$("dashboard-records-grid");
        //     if (_grid) {
        //         _grid.markSorting(_sortRef.current.field, _sortRef.current.direction)
        //     }
        // }
        // if (initState.filter) {
        //     filter.current = initState.filter;
        //     initState.filter = convertFilter2Params(initState.filter)
        // } else {
        //     filter.current = null
        // }
        //
        // initState.pathname = location.pathname;
        // actions.setInitState(initState);

        if (!fetching) {

            // actions.getRecords();
            // actions.getCourses();
            // refreshColumns
        }
    }, [location, filterSelector]);

    const toggleVisible = () => {
        setVisible(!visible);

        setTimeout(() => {
            $(window).trigger('toggle-elements-visible');
            resizeHandler();
        }, 210)
    };

    useEffect(() => {
        if(visible) {
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
        scheme: {
            // $change: getActiveRow
        },
        columns: [
            {id: 'Id', header: 'Id', hidden: true},
            {id: 'CourseName', header: [{text: 'Курс'}], fillspace: 40},
            {id: 'LessonNum', header: 'Номер', fillspace: 20, css: "_container", template: function (val) {
                    return `<div class="centered-by-flex">${val.LessonNum}</div>`;
                }},
            {id: 'LessonName', header: [{text:'Лекция', css: {'text-align': 'center'}}], fillspace: 40},
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
    };


    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {

        const uniqCourseIds = [...new Set(allUnpublishedRecords.map(record => record.CourseId))];
        console.log('uniqCourseIds', uniqCourseIds)


        const courseOptions = (allUnpublishedRecords && allUnpublishedRecords.length > 0) ? uniqCourseIds.map(uniqId => {
            const unpublishedRecord = allUnpublishedRecords.find(record => record.CourseId === uniqId);

            return {
                value: unpublishedRecord.CourseName,
                label: unpublishedRecord.CourseName
            }

        }) : [];

        const lessonOptions = (allUnpublishedRecords && allUnpublishedRecords.length > 0) ? allUnpublishedRecords.map(c => ({
            value: c.LessonName,
            label: c.LessonName
        })) : [];
        return getFilterConfig(filter.current, [], {courseOptions, lessonOptions});
    }, [filter.current, allUnpublishedRecords]);

    const _onApplyFilter = (filterData) => {
        filter.current = filterData;
        let params = convertFilter2Params(filterData);

        actions.applyFilter(params);
        actions.getUnpublishedRecords();
        actions.getUnpublishedRecords(false);
    };

    return (<div className={"unpublished-records-block" + (!visible ? " _hidden" : "")}>
        <div className="unpublished-records-wrapper">

            <h6 className="title _grey100">Неопубликованные лекции</h6>
            <div className="unpublished-records-grid">
                <div className="somediv">

                    <div className="filters">
                        <FilterRow fields={FILTER_CONFIG}
                                   onApply={_onApplyFilter}
                                   onChangeVisibility={_onResize}/>
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
            getRecords,
            setPublishRecordDate,
            applyFilterSilently,
            getUnpublishedRecords
            // getCourses()
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(UnpublishedRecords)
