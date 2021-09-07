import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useWindowSize} from "../../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, refreshColumns, resizeHandler} from "./functions";
import type {GridSortOrder} from "../../../types/grid";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import type {FilterField} from "../../../components/filter/types";
import FilterRow from "../../../components/filter";
import Webix from "../../../components/Webix";
import {hideSideBarMenu, showSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
    displayRecordsSelector,
    elementsFieldSetSelector,
    fetchingSelector,
    getRecords
} from "tt-ducks/dashboard-records";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import './records-list.sass'
import {RECORD_PROCESS_STATES, RECORD_PUBLISHED_STATES} from '../../../constants/dashboard-records';


const staticPartColumnConfig = [
    {
        id: 'Id', header: 'id', hidden: true
    },
    {
        id: 'Week', header: 'Неделя'
    },
    {
        id: 'Date', header: 'Дата',
    },
    {
        id: 'CourseName', header: 'Курс',
    },
    {
        id: 'LessonNum', header: 'Номер лекции/допэпизода',
    },
    {
        id: 'LessonName', header: 'Лекция/допэпизод',
    },
    // {
    //     id: 'ElementsTitle', header: 'Элементы процесса'
    // },
];

const columnConfigObject = {
  Id: {header: 'id', hidden: true},
  Week: { header: 'Неделя'},
  Date: { header: 'Дата'},
  CourseName: { header: 'Курс'},
  LessonNum: { header: 'Номер лекции/допэпизода'},
  LessonName: { header: 'Лекция/допэпизод'},
  ElementsTitle: { header: 'Неделя'}
};
const defaultColumnConfigOne = [
    {
        id: 'Id', header: [{text: 'id', css: 'up-headers'}], hidden: true

    },
    {
        id: 'Week', header: [{text: 'Неделя', css: 'up-headers'}] , css: 'week-up'
    },
    {
        id: 'PubDate', header: [{text: 'Дата', css: 'up-headers'}],
    },
    {
        id: 'CourseName', header: [{text: 'Курс', css: 'up-headers'}], fillspace: true
    },
    {
        id: 'LessonNum', header:  [{text: 'Номер лекции/допэпизода', css: 'up-headers'}],
    },
    {
        id: 'LessonName', header: [{text: 'Лекция/допэпизод', css: 'up-headers'}], fillspace: true
    },
    // {
    //     id: 'ElementsTitle', header: 'Элементы'
    // }
    // {
    //     id: 'Sound', header: 'Звук'
    // },
    // {
    //     id: 'Transcript', header: 'Транскрипт'
    // },
    // {
    //     id: 'Illustration', header: 'Иллюстрация'
    // },
    // {
    //     id: 'Literature', header: 'Литература'
    // },
    // {
    //     id: 'Music', header: 'Музыка'
    // },
    // {
    //     id: 'Text', header: 'Текст'
    // },
    // {
    //     id: 'IsPublished', header: 'Опубликовано'
    // },
    // {
    //     id: 'ProcessState', header: 'Процесс'
    // }
];

const defaultColumnConfigTwo = [
    {
        id: 'IsPublished', header: 'Опубликовано', format: (val) => RECORD_PUBLISHED_STATES[val]
    },
    {
        id: 'ProcessState', header: 'Процесс', format: (val) =>  val ? RECORD_PROCESS_STATES[val] : '--'
    }
]

let recordsCount = 0;

const Records = (props) => {
    const {
        dashboardRecords,
        actions,
        sideBarMenuVisible, fetching,
        elementsFieldSet,
        resizeTrigger
    } = props;


    const [columnFields, setColumnFields] = useState([...defaultColumnConfigOne,...defaultColumnConfigTwo]);

    const _onResize = useCallback(() => {
        console.log('onresize works');
        resizeHandler(recordsCount)
    }, [dashboardRecords]);

    // const columnConfig = useMemo(() => {
    //     console.log('column config');
    //     console.log([...defaultColumnConfigOne, ...elementsFieldSet, ...defaultColumnConfigTwo])
    //     console.log([...elementsFieldSet])
    //     return [...defaultColumnConfigOne, ...elementsFieldSet, ...defaultColumnConfigTwo]
    // },[elementsFieldSet]);

    // const location = useLocation();



    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(recordsCount)
    });

    useEffect(() => {
        console.log('resizeTrigger in records:', resizeTrigger)
        resizeHandler(recordsCount)
    }, [resizeTrigger]);

    useEffect(() => {


        setColumnFields([...defaultColumnConfigOne, ...elementsFieldSet, ...defaultColumnConfigTwo]);
        // setTimeout(() => {

        // }, 500);
        // refreshColumns()
    }, [elementsFieldSet]);

    useEffect(() => {
        refreshColumns(columnFields);
        setTimeout(() => {
            _onResize();
        }, 200);
    }, [columnFields]);

    useEffect(() => {
        recordsCount = dashboardRecords.length;
        if (sideBarMenuVisible) {
            _onResize();
        } else {
            setTimeout(() => {
                _onResize();
            }, 200);
        }
    }, [dashboardRecords]);

    useEffect(() => {
        const initState = parseParams();
        if (initState.order) {
            _sortRef.current = initState.order;
            const _grid = window.webix.$$("dashboard-records-grid");
            if (_grid) {
                _grid.markSorting(_sortRef.current.field, _sortRef.current.direction)
            }
        }
        if (initState.filter) {
            filter.current = initState.filter;
            initState.filter = convertFilter2Params(initState.filter)
        } else {
            filter.current = null
        }

        initState.pathname = location.pathname;
        actions.setInitState(initState);

        if (!fetching) {
            actions.getRecords()
            // refreshColumns
        }
    }, [location]);

    const GRID_CONFIG = useMemo(() => {
        return {
        view: "datatable",
        id: 'dashboard-records-grid',
        css: 'tt-grid ',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 1000,
        select: true,
        editable: false,
            scheme: {
                $change: function (item) {
                    if (item.IsEven){
                        item.$css = "even-record";
                    }
                }
            },
        columns: [],
        on: {
            onHeaderClick: function (header) {
                const _sort: GridSortOrder = _sortRef.current;

                if (header.column !== _sort.field) {
                    _sort.field = header.column
                    _sort.direction = GRID_SORT_DIRECTION.ACS
                } else {
                    _sort.direction = _sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : _sort.type = GRID_SORT_DIRECTION.ACS
                }

                actions.setGridSortOrder(_sort);
                this.markSorting(_sort.field, _sort.direction);
            },
            onItemDblClick: function (id) {
                // const item = this.getItem(id);
                //
                // if (item && item.Id) {
                //     // todo open action
                //     actions.selectTimeline(item.Id);
                //     props.history.push(`timelines/${item.Id}`);
                // }

            }
        },
        onClick: {
            "js-publish": function (e, data) {
                e.preventDefault()
                const item = this.getItem(data.row);
                if (item) {
                    actions.publishTimeline(item.Id, true);
                    // actions.updateTimeline(item.Id, {
                    //     ...item,
                    //     State: 2
                    // });
                    actions.getTimelines();
                }
            },
            "js-copy": function (e, data) {
                e.preventDefault();
                const item = this.getItem(data.row);
                if (item) {
                    //todo copy action after api complete
                }
            },
            "remove-timeline-button": function (e, data) {
                e.preventDefault();
                const item = this.getItem(data.row);
                if (item) {
                    (+item.State) === 1 && actions.removeTimeline(item.Id);
                    actions.getTimelines();
                }
            }
        },
    }}, [columnFields]);

    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {
        return getFilterConfig(filter.current)
    }, [filter.current]);

    const _onApplyFilter = (filterData) => {
        filter.current = filterData;
        let params = convertFilter2Params(filterData);
        actions.applyFilter(params)
    };



    return (
        <React.Fragment>
            <div className="records-page form _scrollable-y">
                {/*<h5 className="form-header _grey70">План публикаций</h5>*/}

                <div className="filters">
                    <FilterRow fields={FILTER_CONFIG}
                               onApply={_onApplyFilter}
                               onChangeVisibility={_onResize}/>


                    <button  disabled={true} style={{pointerEvents: 'none'}} className="open-form-button" >

                    </button>
                </div>

                <div className="grid-container dashboard-records-table unselectable">
                    <Webix ui={GRID_CONFIG} data={dashboardRecords}/>
                </div>
            </div>

        </React.Fragment>
    )
}

const mapState2Props = (state) => {
    return {
        dashboardRecords: displayRecordsSelector(state),
        sideBarMenuVisible: sideBarMenuVisible(state),
        fetching: fetchingSelector(state),
        elementsFieldSet: elementsFieldSetSelector(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            hideSideBarMenu, showSideBarMenu,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            getRecords
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(Records)
