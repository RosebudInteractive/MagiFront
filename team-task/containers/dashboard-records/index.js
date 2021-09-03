import React, {useEffect, useState} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./dashboard-records.sass"
import {hideSideBarMenu, showSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import {recordsSelector} from "tt-ducks/dashboard-records"
import Records from "./records-list"
import UnpublishedRecords from "./unpublished-records";
import DashboardRecordsHeader from "./header"
import {useHistory} from "react-router-dom";

function DashboardRecords(props) {
    const {sideBarMenuVisible, dashboardRecords, actions} = props;
    const [resizeTrigger, triggerResize] = useState(true);

    const history = useHistory();

    useEffect(() => {
        actions.hideSideBarMenu();

        return () => actions.showSideBarMenu();
    },[]);

    const backAction = () => {
        !sideBarMenuVisible && actions.showSideBarMenu();
        history.push('/')
    };

    return (
        <div className="dashboard">
            <DashboardRecordsHeader title={'Издательский план'} onBack={backAction}/>
            {/*<div className="header">*/}
                {/*<h5 className="form-header _grey70">План публикаций</h5>*/}
                {/*<FilterRow fields={FILTER_CONFIG}*/}
                {/*           onApply={_onApplyFilter}*/}
                {/*           onChangeVisibility={_onResize}/>*/}
            {/*</div>*/}

            <div className="dashboard-body">
                <div className="unpublished-records" >

                    <UnpublishedRecords resizeTriggerFn={() => {
                        console.log('it works')
                        triggerResize(!resizeTrigger)
                    }}/>
                    {/*<div className='button' style={{width: '50px', height: '50px', background: 'blue'}} onClick={openPane}>*/}
                    {/*    button*/}
                    {/*</div>*/}
                    {/*    //     unpublished record here*/}
                </div>

                <div className="records">
                    <Records resizeTrigger={resizeTrigger}/>
                </div>
            </div>


        </div>
    )
}

const mapState2Props = (state) => {
    return {
        dashboardRecords: recordsSelector(state),
        sideBarMenuVisible: sideBarMenuVisible(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            hideSideBarMenu, showSideBarMenu
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(DashboardRecords)

