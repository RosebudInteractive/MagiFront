import React, {useEffect, useState} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./dashboard-records.sass"
import {hideSideBarMenu, showSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import {
    changeViewMode,
    closeModalDndToPublish,
    displayRecordsSelector,
    getUnpublishedRecords,
    modalPublishIsOnSelector,
    openModalDndToPublish,
    unpublishedRecordsSelector
} from "tt-ducks/dashboard-records"
import Records from "./records-list"
import UnpublishedRecords from "./unpublished-records";
import DashboardRecordsHeader from "./header"
import {useHistory} from "react-router-dom";
import Modal from "../../components/modal";
import ConfirmationOfPublication from "./confirmation-of-publication";
import 'react-splitter-layout/lib/index.css';

function DashboardRecords(props) {
    const {sideBarMenuVisible, actions, unpublishedRecords, modalPublishOn} = props;
    const [resizeTrigger, triggerResize] = useState(true);
    const [unpublishedPanelOpened, setPanelOpened] = useState(false);

    const history = useHistory();

    useEffect(() => {
        actions.hideSideBarMenu();
        actions.getUnpublishedRecords(false);
        actions.getUnpublishedRecords();

        return () => actions.showSideBarMenu();
    },[]);

    const unpublishedPanelToggled = (panelOpened) => {
        triggerResize(!resizeTrigger);
        setPanelOpened(panelOpened);
    };


    const changeMode = (mode) => {
        actions.changeViewMode(mode);
    };

    const backAction = () => {
        !sideBarMenuVisible && actions.showSideBarMenu();
        history.push('/')
    };

    return (
        <div className="dashboard">
            <DashboardRecordsHeader title={'Издательский план'} onBack={backAction} onChangeMode={changeMode}/>
            {/*<div className="header">*/}
                {/*<h5 className="form-header _grey70">План публикаций</h5>*/}
                {/*<FilterRow fields={FILTER_CONFIG}*/}
                {/*           onApply={_onApplyFilter}*/}
                {/*           onChangeVisibility={_onResize}/>*/}
            {/*</div>*/}

            <div className="dashboard-body">
                {/*<SplitterLayout customClassName="dashboard-body">*/}
                    <div className="unpublished-records" >

                        <UnpublishedRecords unpublishedRecords={unpublishedRecords} resizeTriggerFn={unpublishedPanelToggled}/>
                        {/*<div className='button' style={{width: '50px', height: '50px', background: 'blue'}} onClick={openPane}>*/}
                        {/*    button*/}
                        {/*</div>*/}
                        {/*    //     unpublished record here*/}
                    </div>

                    <div className="records">
                        <Records resizeTrigger={resizeTrigger} unpublishedPanelOpened={unpublishedPanelOpened} openModalOnPublication={actions.openModalDndToPublish}/>
                    </div>
                {/*</SplitterLayout>*/}
            </div>


            {modalPublishOn &&
                <Modal WrappedComponent={ConfirmationOfPublication} title={'Выбор даты публикации'} closeAction={() => {
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
        modalPublishOn: modalPublishIsOnSelector(state)
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
            openModalDndToPublish
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(DashboardRecords)

