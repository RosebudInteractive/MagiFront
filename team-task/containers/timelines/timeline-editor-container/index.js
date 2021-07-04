import React, {useEffect, useState} from "react";
import {showSideBarMenu} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import './timeline-editor-container.sass'
import TimelineEditorHeader from "../../../components/timelines/editor/timeline-editor-header";
import TimelineForm from "../../../components/timelines/editor/timeline-form";
import TimelinePreview from "../../../components/timelines/preview";
import TimelineDetails from "../../../components/timelines/details";
import {currentTimelineSelector, timelineOpenedSelector} from "../../../ducks/timelines";


function TimelineEditorContainer(props) {
    const {actions, selectedTimeline} = props;
    const [mainFormPristine, setMainFormPristine] = useState(true);

    const formChangedCb = (pristine) => {
        setMainFormPristine(pristine)
    };

    useEffect(() => {

        return function () {
            actions.showSideBarMenu()
        }
    }, []);


    return (
        <div className="timeline-editor-container">
            <TimelineEditorHeader name={selectedTimeline.Name}
                                  state={selectedTimeline.State}
                                  mainFormPristine={mainFormPristine}/>
            <TimelineForm data={selectedTimeline}
                          onChangeFormCallback={formChangedCb}/>
            <TimelinePreview/>
            <TimelineDetails/>
        </div>
    )
}

const mapState2Props = (state) => {
    return {
        selectedTimeline: currentTimelineSelector(state),
        editorOpened: timelineOpenedSelector(state)
        //todo add selectors
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            showSideBarMenu
            //todo add actions
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(TimelineEditorContainer)

