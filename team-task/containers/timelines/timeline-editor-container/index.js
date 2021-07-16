import React, {useEffect, useRef, useState} from "react";
import {hideSideBarMenu, showSideBarMenu} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import './timeline-editor-container.sass'
import TimelineEditorHeader from "../../../components/timelines/editor/header";
import TimelineForm from "../../../components/timelines/editor/form";
import TimelinePreview from "../../../components/timelines/preview";
import TimelineDetails from "../../../components/timelines/details";
import {
    clearSelectedTimeline,
    createNewTimeline,
    currentTimelineSelector,
    getOneTimeline,
    getTimelines,
    goBack,
    linkEvent,
    linkPeriod,
    timelineOpenedSelector,
    timelinesSelector,
    updateTimeline
} from "../../../ducks/timelines";
import {coursesSelector, getAllLessons, lessonsSelector} from "../../../ducks/dictionary";
import {
    createEvents,
    createNewEvent,
    currentEventSelector,
    eventEditorOpenedSelector,
    eventsSelector,
    findedEventsSelector,
    findEvent,
    openEventEditor,
    removeEvent,
    requestEvents,
    setTemporaryEvents,
    temporaryEventsSelector,
    toggleEditorTo,
    updateEventData,
} from "tt-ducks/events-timeline";
import {useLocation,} from "react-router-dom"
import Modal from "../../../components/events/modal"
import EventForm from "../../../components/events/form"
import PeriodForm from "../../../components/periods/form"
import PeriodsFindForm from "../../../components/periods/find-form";
import EventsFindForm from "../../../components/events/find-form";

import {
    createNewPeriod,
    currentPeriodSelector,
    findedPeriodsSelector,
    findPeriod,
    openPeriodEditor,
    periodEditorOpenedSelector,
    periodsSelector,
    removePeriod,
    requestPeriods,
    setTemporaryPeriods,
    temporaryPeriodsSelector,
    toggleEditorTo as toggleEditorToPeriod,
    updatePeriodData
} from "tt-ducks/periods-timeline";

const DEFAULT_TIMELINE = {
    Name: '',
    Course: {CourseId: null, Name: ''},
    Lesson: {LessonId: null, Name: ''},
    CourseId: null,
    LessonId: null,
    Order: 0,
    SpecifCode: 'specif-code-string',
    State: 1,
    Image: null,
    TypeOfUse: 1
};

let sTimeline = null;

function TimelineEditorContainer(props) {
    const {
        actions, selectedTimeline, lessons,
        courses, selectedEvent, eventEditorOpened,
        selectedPeriod, findedPeriods,
        timelinesAll, findedEvents, periodEditorOpened
        , temporaryEvents, temporaryPeriods
    } = props;
    const [mainFormPristine, setMainFormPristine] = useState(true);
    const [timeline, setTimeline] = useState(null);
    const [changedValues, setChangedValues] = useState({});
    const detailsEditor = useRef(null);
    const finderForm = useRef(null);
    const [finderFormOpened, setFinderFormOpened] = useState(false);
    const location = useLocation();

    const formChangedCb = (pristine, {values}) => {
        values && setChangedValues(values);
        setMainFormPristine(pristine)
    };

    const closeModal = () => {
        actions.toggleEditorTo(false);
        actions.toggleEditorToPeriod(false);
    };

    const doubleClickAction = function ({id, type}) {
        if (id && type) {
            if (type === 'periods') {

                detailsEditor.current = PeriodForm;
                if (sTimeline.Periods && sTimeline.Periods.length > 0 && sTimeline.Periods.find(pr => (pr.Id) && pr.Id === id)) {
                    const periodToSet = sTimeline.Periods.find(pr => pr.Id === id);
                    actions.openPeriodEditor({periodId: id, period: periodToSet, timelineId: sTimeline.Id});
                } else {
                    actions.openPeriodEditor({periodId: id});
                }
            }
            if (type === 'events') {
                detailsEditor.current = EventForm;
                if (sTimeline.Events && sTimeline.Events.length > 0 && sTimeline.Events.find(pr => (pr.Id) && pr.Id === id)) {
                    const eventToSet = sTimeline.Events.find(pr => (pr.Id) && pr.Id === id);
                    actions.openEventEditor({eventId: id, event: eventToSet, timelineId: sTimeline.Id});
                } else {
                    actions.openEventEditor({eventId: id});
                }
            }
        }
    };

    useEffect(() => {
        const search = parseInt(location.pathname.split("/timelines/")[1]);

        if (search) {
            actions.getOneTimeline({id: search});
        }

        actions.getTimelines()
    }, [location]);

    useEffect(() => {
        sTimeline = selectedTimeline.Id && selectedTimeline;
        setTimeline(selectedTimeline.hasOwnProperty('State') ? selectedTimeline : DEFAULT_TIMELINE);
    }, [selectedTimeline]);


    useEffect(() => {
        if (timeline && timeline.hasOwnProperty('State')) {
            actions.hideSideBarMenu();
            (!lessons || lessons.length === 0) && actions.getAllLessons(true, false);
            (!lessons || lessons.length === 0) && actions.getAllLessons(true, false); // todo for courses
        }
    }, [timeline, lessons, courses]);


    useEffect(() => {

        return function () {
            setTemporaryEvents(null);
            setTemporaryPeriods(null);
            actions.showSideBarMenu();
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
                                      isCreate={!timeline.Id}
                                      onSave={(timelineFormData) => {

                                          if (timeline.Id) {
                                              actions.updateTimeline(timeline.Id, {
                                                  ...timeline,
                                                  Name: timelineFormData.name,
                                                  CourseId: changedValues.courseId,
                                                  LessonId: changedValues.lessonId,
                                                  TypeOfUse: changedValues.typeOfUse,
                                                  Order: changedValues.orderNumber,
                                                  Image: changedValues.image
                                              });
                                          } else {
                                              actions.createNewTimeline({
                                                      ...timeline,
                                                      Name: timelineFormData.name,
                                                      CourseId: changedValues.courseId,
                                                      LessonId: changedValues.lessonId,
                                                      TypeOfUse: changedValues.typeOfUse,
                                                      Order: changedValues.orderNumber,
                                                      Image: changedValues.image
                                                  },
                                                  true,
                                                  temporaryEvents && temporaryEvents.length > 0 ? temporaryEvents : [],
                                                  temporaryPeriods && temporaryPeriods.length > 0 ? temporaryPeriods : [])
                                          }
                                          actions.goBack();
                                          actions.getTimelines();
                                      }}
                />

                {(lessons && courses) &&
                <TimelineForm data={timeline}
                              onChangeFormCallback={formChangedCb}
                              lessons={lessons}
                              courses={courses}/>
                }
                <TimelinePreview
                    background={(changedValues.image && changedValues.image.file) ? changedValues.image.file : timeline.Image ? timeline.Image : null}/>

                <TimelineDetails actions={{
                    events: {
                        headerClickAction: () => {
                        },
                        doubleClickAction: (id) => doubleClickAction({id: id, type: 'events'}),
                        deleteAction: (id) => {
                            id && actions.removeEvent(id);
                        },
                        createAction: () => {
                            detailsEditor.current = EventForm;
                            const timelineId = timeline.Id ? timeline.Id : null;

                            actions.openEventEditor({timelineId: timelineId});
                        },
                        openFindFormAction: () => {
                            finderForm.current = EventsFindForm;
                            setFinderFormOpened(true);
                        }
                    }
                    , periods: {
                        headerClickAction: () => {
                        },
                        doubleClickAction: (id) => doubleClickAction({id: id, type: 'periods'})
                        ,
                        deleteAction: (id) => {
                            actions.removePeriod(id);
                        },
                        createAction: () => {
                            detailsEditor.current = PeriodForm;
                            const timelineId = (timeline && timeline.Id) ? timeline.Id : null;
                            actions.openPeriodEditor({timelineId: timelineId});
                        },
                        openFindFormAction: () => {
                            finderForm.current = PeriodsFindForm;
                            setFinderFormOpened(true);
                        }
                    }
                }} events={timeline.Id ? timeline.Events :
                    temporaryEvents ? temporaryEvents : []}
                                 periods={timeline.Id ? timeline.Periods :
                                     temporaryPeriods ? temporaryPeriods : []}
                                 findedEvents={findedEvents}
                                 findedPeriods={findedPeriods}
                                 timelineId={timeline.Id}/>
            </React.Fragment>
            }

            {((eventEditorOpened || periodEditorOpened) && timelinesAll && detailsEditor.current) &&
            <Modal WrappedComponent={detailsEditor.current} wrappedProps={{
                eventData: selectedEvent,
                periodData: selectedPeriod,
                closeModalCb: closeModal,
                timelines: timelinesAll,
                timelineId: timeline.Id,
                onSave: (id, values) => {
                    if (eventEditorOpened) {
                        if (id) {
                            actions.updateEventData({eventId: id, eventData: values})
                        } else {
                            if (timeline && timeline.Id) {
                                actions.createNewEvent({
                                    Date: values.date,
                                    Description: values.description,
                                    Month: values.month,
                                    Name: values.name,
                                    ShortName: values.shortName,
                                    Year: values.year,
                                    State: 1,
                                    TlCreationId: values.tlCreationId
                                })
                            } else {
                                const evs = temporaryEvents ? temporaryEvents : [];
                                actions.setTemporaryEvents([...evs, {
                                    Date: values.date,
                                    Description: values.description,
                                    Month: values.month,
                                    Name: values.name,
                                    ShortName: values.shortName,
                                    Year: values.year,
                                    State: 1
                                }])
                            }
                        }
                    }

                    if (periodEditorOpened) {
                        if (id) {
                            actions.updatePeriodData({periodId: id, periodData: values})
                        } else {
                            if (timeline && timeline.Id) {
                                actions.createNewPeriod(values)
                            } else {
                                const prds = temporaryPeriods ? temporaryPeriods : [];
                                actions.setTemporaryPeriods([...prds, {
                                    ...values, Name: values.name,
                                    ShortName: values.shortName,
                                    Year: values.year,
                                    State: 1
                                }]) //half pammed inside method setTemporary
                            }

                        }
                    }

                    actions.toggleEditorTo(false);
                    actions.toggleEditorToPeriod(false);
                }
            }}/>
            }

            {finderFormOpened && <Modal WrappedComponent={finderForm.current}
                                        commonHeader={true}
                                        closeAction={() => {
                                            (timeline && timeline.Id) && actions.getOneTimeline({id: timeline.Id});
                                            setFinderFormOpened(false);
                                        }}
                                        wrappedProps={{
                                            findedData: finderForm.current === PeriodsFindForm ? findedPeriods : findedEvents,
                                            addEventsAction: (eventsData) => {
                                                if (timeline && timeline.Id) {
                                                    eventsData.forEach(id => actions.linkEvent({
                                                        eventId: id,
                                                        timelineId: timeline.Id
                                                    }));
                                                } else {
                                                    const tEvs = temporaryEvents ? temporaryEvents : [];
                                                    actions.setTemporaryEvents([...tEvs].push(eventsData));
                                                }
                                            },

                                            addPeriodsAction: (eventsData) => {
                                                if (timeline && timeline.Id) {
                                                    eventsData.forEach(id => actions.linkEvent({
                                                        eventId: id,
                                                        timelineId: timeline.Id
                                                    }));
                                                } else {
                                                    const tEvs = temporaryEvents ? temporaryEvents : [];
                                                    actions.setTemporaryEvents([...tEvs].push(eventsData));
                                                }
                                            },
                                            findAction: (elData) => {
                                                finderForm === PeriodsFindForm ?
                                                    actions.findPeriod(elData) :
                                                    actions.findEvent(elData);
                                            },
                                            closeAction: () => {
                                                (timeline && timeline.Id) && actions.getOneTimeline({id: timeline.Id});
                                                setFinderFormOpened(false);
                                                finderForm.current = null
                                            }
                                        }}/>}
        </div>
    )
}

const mapState2Props = (state) => {
    return {
        selectedTimeline: currentTimelineSelector(state),
        editorOpened: timelineOpenedSelector(state),
        lessons: lessonsSelector(state),
        events: eventsSelector(state),
        selectedEvent: currentEventSelector(state),
        eventEditorOpened: eventEditorOpenedSelector(state),
        timelinesAll: timelinesSelector(state),
        findedEvents: findedEventsSelector(state),
        periods: periodsSelector(state),
        periodEditorOpened: periodEditorOpenedSelector(state),
        selectedPeriod: currentPeriodSelector(state),
        findedPeriods: findedPeriodsSelector(state),
        temporaryEvents: temporaryEventsSelector(state),
        temporaryPeriods: temporaryPeriodsSelector(state),
        courses: coursesSelector(state),
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
            requestEvents,
            openEventEditor,
            getOneTimeline,
            updateTimeline,
            toggleEditorTo,
            getTimelines,
            createNewEvent,
            updateEventData,
            findEvent,
            linkEvent,
            removeEvent,
            requestPeriods,
            updatePeriodData,
            toggleEditorToPeriod,
            openPeriodEditor,
            removePeriod,
            findPeriod,
            createNewPeriod,
            linkPeriod,
            setTemporaryEvents,
            setTemporaryPeriods,
            createEvents,
            clearSelectedTimeline
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(TimelineEditorContainer)

