import React, {useEffect, useState} from "react";
import {hideSideBarMenu, showSideBarMenu} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import './timeline-editor-container.sass'
import TimelineEditorHeader from "../../../components/timelines/editor/header";
import TimelineForm from "../../../components/timelines/editor/form";
import TimelinePreview from "../../../components/timelines/preview";
import TimelineDetails from "../../../components/timelines/details";
import {createNewTimeline, currentTimelineSelector, goBack, timelineOpenedSelector} from "../../../ducks/timelines";
import {getAllLessons, lessonsSelector} from "../../../ducks/dictionary";

const DEFAULT_TIMELINE = {
    Name: '',
    Course: {CourseId: null, DisplayName: ''},
    Lesson: {LessonId: null, DisplayName: ''},
    CourseId: null,
    LessonId: null,
    Order: 0,
    SpecifCode: 'specif-code-string',
    State: 1,
    Image: null,
    TypeOfUse: 2
};

function TimelineEditorContainer(props) {
    const {actions, selectedTimeline, lessons, courses} = props;
    const [mainFormPristine, setMainFormPristine] = useState(true);
    const [timeline, setTimeline] = useState(selectedTimeline ? selectedTimeline : DEFAULT_TIMELINE);
    const [changedValues, setChangedValues] = useState({});

    const formChangedCb = (pristine, {values}) => {
        values && setChangedValues(values);
        setMainFormPristine(pristine)
    };

    useEffect(() => {
        setTimeline(selectedTimeline.hasOwnProperty('State') ? selectedTimeline : DEFAULT_TIMELINE);
    }, [selectedTimeline]);

    useEffect(() => {
        if (timeline && timeline.hasOwnProperty('State')) {
            actions.hideSideBarMenu();
            (!lessons || lessons.length === 0) && actions.getAllLessons(true, false);
        }
    }, [timeline, lessons, courses]);

    useEffect(() => {

        return function () {
            actions.showSideBarMenu()
        }
    }, []);

    return (
        <div className="timeline-editor-container">
            {timeline && timeline.State &&
            <React.Fragment>
                <TimelineEditorHeader name={timeline.Name}
                                      state={timeline.State}
                                      mainFormPristine={mainFormPristine}
                                      onBack={() => actions.goBack()}
                                      onSave={(timelineFormData) => {
                                          console.log('timelineFormData:', timelineFormData)
                                          console.log('changedValues:', changedValues)
                                          actions.createNewTimeline({
                                              ...timeline,
                                              Name: timelineFormData.name,
                                              CourseId: changedValues.courseId,
                                              LessonId: changedValues.lessonId,
                                              TypeOfUse: changedValues.typeOfUse,
                                              Order: changedValues.orderNumber,
                                              Image: changedValues.image
                                          });
                                      }}
                />

                {(lessons || courses) &&
                <TimelineForm data={timeline}
                              onChangeFormCallback={formChangedCb}
                              lessons={lessons}
                              courses={courses}/>
                }
                <TimelinePreview
                    background={(changedValues.image && changedValues.image.file) ? changedValues.image.file : null}/>
                <TimelineDetails/>
            </React.Fragment>

            }
        </div>
    )
}

const mapState2Props = (state) => {
    return {
        selectedTimeline: currentTimelineSelector(state),
        editorOpened: timelineOpenedSelector(state),
        lessons: lessonsSelector(state)
        //todo add selectors
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            showSideBarMenu,
            hideSideBarMenu,
            goBack,
            createNewTimeline,
            getAllLessons,
            //todo add actions
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(TimelineEditorContainer)

