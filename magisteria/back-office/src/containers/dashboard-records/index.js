import React, {useEffect, useMemo, useState} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./dashboard-records.sass"
import {hideSideBarMenu, showSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import {
    additionalInfoSelector,
    changePublishRecordDate,
    changeViewMode,
    closeModalDndToPublish,
    displayRecordsSelector,
    getCourseFilterOptions,
    getDashboardUnpublishedLessons,
    getUnpublishedRecords,
    modalPublishIsOnSelector,
    modeSelector,
    openModalDndToPublish,
    selectedRecordSelector,
    setPublishRecordDate,
    unpublishedRecordsSelector
} from "tt-ducks/dashboard-records"

import Records from "./records-list"
import UnpublishedRecords from "./unpublished-records";
import DashboardRecordsHeader from "./header"
import {useHistory} from "react-router-dom";
import Modal from "../../components/modal";
import ConfirmationOfPublication from "./confirmation-of-publication";
import 'react-splitter-layout/lib/index.css';
import {applyFilter, filterSelector, paramsSelector, setDashboardViewMode, setInitState} from "tt-ducks/route";
import moment from "moment";
import {permissionsSelector} from "tt-ducks/auth";

function DashboardRecords(props) {
    const {sideBarMenuVisible, actions, unpublishedRecords, modalPublishOn, selectedRecord, vMode, permissions, filter, additionalInfo} = props;
    const [resizeTrigger, triggerResize] = useState(true);
    const [unpublishedPanelOpened, setPanelOpened] = useState(false);
    const [dateRange, setDateRange] = useState('');

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

    useEffect(() => {
        let finDate, stDate;

        if (filter.st_date && filter.fin_date) {
            stDate = moment(filter.st_date).locale('ru').format('DD.MM.YY');
            finDate = moment(filter.fin_date).locale('ru').format('DD.MM.YY');
        } else {
            const nowDate = moment().locale('ru');

            stDate = nowDate.format('DD.MM.YY');
            finDate = nowDate.add(1, 'month').format('DD.MM.YY') //1 month is default value when filter is not used
        }

        setDateRange(`?? ${stDate} ???? ${finDate}`);
    }, [filter]);

    const changeMode = (mode) => {
        actions.setDashboardViewMode(mode);
        actions.changeViewMode(mode);
    };

    const changeDate = (record) => {
        actions.changePublishRecordDate(record.id, record);
    };

    const backAction = () => {
        !sideBarMenuVisible && actions.showSideBarMenu();
        history.push('/')
    };

    const accessLevel = useMemo(() => permissions.dsb && permissions.dsb.al || 0, [permissions])

    return (
        <div className="dashboard" >
            <DashboardRecordsHeader title={'???????????????????????? ????????'} dateRange={dateRange} additionalInfo={additionalInfo} onBack={backAction}
                                    onChangeMode={changeMode} mode={vMode}/>

            <div className="dashboard-body">
                {
                    (accessLevel > 1) &&
                    <div className="unpublished-records">
                        <UnpublishedRecords unpublishedRecords={unpublishedRecords}
                                            resizeTriggerFn={unpublishedPanelToggled}/>
                    </div>
                }
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
            }} WrappedComponent={ConfirmationOfPublication} title={'?????????? ???????? ????????????????????'} closeAction={() => {
                actions.closeModalDndToPublish();
            }}/>
            }
        </div>
    )
}

const mapState2Props = (state) => {
    return {
        permissions: permissionsSelector(state),
        unpublishedRecords: unpublishedRecordsSelector(state),
        dashboardRecords: displayRecordsSelector(state),
        sideBarMenuVisible: sideBarMenuVisible(state),
        modalPublishOn: modalPublishIsOnSelector(state),
        selectedRecord: selectedRecordSelector(state),
        filter: filterSelector(state),
        vMode: modeSelector(state),
        params: paramsSelector(state),
        additionalInfo: additionalInfoSelector(state)
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
            applyFilter,
            setDashboardViewMode
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(DashboardRecords)

