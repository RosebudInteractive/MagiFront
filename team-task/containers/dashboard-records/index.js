import React, {useCallback, useEffect, useState} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./dashboard-records.sass"
import {hideSideBarMenu, showSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import {
    changePublishRecordDate,
    changeViewMode,
    closeModalDndToPublish,
    displayRecordsDateRangeString,
    displayRecordsSelector,
    getCourseFilterOptions,
    getUnpublishedRecords,
    modalPublishIsOnSelector,
    modeSelector,
    openModalDndToPublish,
    selectedRecordSelector,
    setPublishRecordDate,
    unpublishedRecordsSelector,
    getDashboardUnpublishedLessons
} from "tt-ducks/dashboard-records"

import Records from "./records-list"
import UnpublishedRecords from "./unpublished-records";
import DashboardRecordsHeader from "./header"
import {useHistory} from "react-router-dom";
import Modal from "../../components/modal";
import ConfirmationOfPublication from "./confirmation-of-publication";
import 'react-splitter-layout/lib/index.css';
import {applyFilter, paramsSelector, setInitState} from "tt-ducks/route";

function DashboardRecords(props) {
    const {sideBarMenuVisible, actions, unpublishedRecords, modalPublishOn, selectedRecord, dateRange, vMode, params} = props;
    const [resizeTrigger, triggerResize] = useState(true);
    const [unpublishedPanelOpened, setPanelOpened] = useState(false);

    const history = useHistory();

    useEffect(() => {
        actions.hideSideBarMenu();
        actions.getDashboardUnpublishedLessons();
        actions.getUnpublishedRecords();
        actions.getCourseFilterOptions();

        return () => actions.showSideBarMenu();
    }, []);

    const unpublishedPanelToggled = (panelOpened) => {
        triggerResize(!resizeTrigger);
        setPanelOpened(panelOpened);
    };

    const applyViewMode = useCallback((mode) => {
        const newUrlParams = new URLSearchParams(params);
        const paramsObject = {};

        if(newUrlParams.has('st_date') && newUrlParams.has('fin_date')){
            paramsObject.st_date = newUrlParams.get('st_date');
            paramsObject.fin_date = newUrlParams.get('fin_date');
        }

        if(newUrlParams.has('course')){
            paramsObject.course = newUrlParams.get('course');
        }

        paramsObject.viewMode = mode;

        actions.applyFilter(paramsObject);
    }, [params]);

    const changeMode = (mode) => {
        applyViewMode(mode);
        actions.changeViewMode(mode);
    };

    const changeDate = (record) => {
        actions.changePublishRecordDate(record.id, record);
    };

    const backAction = () => {
        !sideBarMenuVisible && actions.showSideBarMenu();
        history.push('/')
    };

    return (
        <div className="dashboard">
            <DashboardRecordsHeader title={'Издательский план'} dateRange={dateRange} onBack={backAction} onChangeMode={changeMode} mode={vMode}/>
            <div className="dashboard-body">
                <div className="unpublished-records">
                    <UnpublishedRecords unpublishedRecords={unpublishedRecords}
                                        resizeTriggerFn={unpublishedPanelToggled}/>
                </div>

                <div className="records">
                    <Records resizeTrigger={resizeTrigger}
                             unpublishedPanelOpened={unpublishedPanelOpened}
                             openModalOnPublication={actions.openModalDndToPublish}/>
                </div>
            </div>
            {modalPublishOn &&
            <Modal wrappedProps={{
                record: selectedRecord,
                applyAction: changeDate,
                closeAction: actions.closeModalDndToPublish
            }} WrappedComponent={ConfirmationOfPublication} title={'Выбор даты публикации'} closeAction={() => {
                actions.closeModalDndToPublish();
            }}/>
            }
        </div>
    )
}

const mapState2Props = (state) => {
    return {
        unpublishedRecords: unpublishedRecordsSelector(state),
        dashboardRecords: displayRecordsSelector(state),
        sideBarMenuVisible: sideBarMenuVisible(state),
        modalPublishOn: modalPublishIsOnSelector(state),
        selectedRecord: selectedRecordSelector(state),
        dateRange: displayRecordsDateRangeString(state),
        vMode: modeSelector(state),
        params: paramsSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            hideSideBarMenu,
            showSideBarMenu,
            changeViewMode,
            getUnpublishedRecords,
            closeModalDndToPublish,
            openModalDndToPublish,
            getDashboardUnpublishedLessons,
            changePublishRecordDate,
            setPublishRecordDate,
            getCourseFilterOptions,
            setInitState,
            applyFilter
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(DashboardRecords)

