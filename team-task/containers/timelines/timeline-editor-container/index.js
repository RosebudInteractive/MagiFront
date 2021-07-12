import React, {useEffect, useState} from "react";
import {hideSideBarMenu, showSideBarMenu} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import './timeline-editor-container.sass'
import TimelineEditorHeader from "../../../components/timelines/editor/header";
import TimelineForm from "../../../components/timelines/editor/form";
import TimelinePreview from "../../../components/timelines/preview";
import TimelineDetails from "../../../components/timelines/details";
import {
    createNewTimeline,
    currentTimelineSelector,
    getOneTimeline,
    getTimelines,
    goBack,
    linkEvent,
    timelineOpenedSelector,
    timelinesSelector,
    updateTimeline
} from "../../../ducks/timelines";
import {getAllLessons, lessonsSelector} from "../../../ducks/dictionary";
import {
    createNewEvent,
    currentEventSelector,
    eventEditorOpenedSelector,
    eventsSelector,
    findedEventsSelector,
    findEvent,
    openEventEditor,
    removeEvent,
    requestEvents,
    toggleEditorTo,
    updateEventData
} from "tt-ducks/events-timeline";
import {useLocation,} from "react-router-dom"
import Modal from "../../../components/events/modal"
import EventForm from "../../../components/events/form"
import EventsFindForm from "../../../components/events/find-form";

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
    const {actions, selectedTimeline, lessons, courses, selectedEvent, eventEditorOpened, timelinesAll, findedEvents} = props;
    const [mainFormPristine, setMainFormPristine] = useState(true);
    const [timeline, setTimeline] = useState(selectedTimeline ? selectedTimeline : DEFAULT_TIMELINE);
    const [changedValues, setChangedValues] = useState({});
    const [periods, setPeriods] = useState([]); //todo finish for periods, remove it
    const [events, setEvents] = useState([]);
    const [finderFormOpened, setFinderFormOpened] = useState(false);
    const location = useLocation();

    const formChangedCb = (pristine, {values}) => {
        console.log('values is:', values)
        values && setChangedValues(values);
        setMainFormPristine(pristine)
    };

    const closeModal = () => {
        actions.toggleEditorTo(false);
    };

    useEffect(() => {
        if (events && events.length > 0) {
            console.log('events:', events);
        }
    }, [events]);

    useEffect(() => {
        console.log('location, ', location)

        const search = parseInt(location.pathname.split("/timelines/")[1]);

        if (search) {
            console.log("search", search);
            actions.getOneTimeline({id: search});
        }

        actions.getTimelines()
        // timelinesAll
    }, [location]);

    useEffect(() => {

        setTimeline(selectedTimeline.hasOwnProperty('State') ? selectedTimeline : DEFAULT_TIMELINE);
    }, [selectedTimeline]);

    useEffect(() => {
        console.log('eventEditorOpened', eventEditorOpened)
    }, [eventEditorOpened]);

    useEffect(() => {
        if (timeline && timeline.hasOwnProperty('State')) {
            actions.hideSideBarMenu();
            (!lessons || lessons.length === 0) && actions.getAllLessons(true, false);

            // const eventsAndPeriods = (id) => {
            //     actions.requestEvents(id);
            //     (() => {
            //     })() // todo actions.getPeriods()
            // };
            // timeline.Id && actions.getOneTimeline(timeline.Id);

        }
    }, [timeline, lessons, courses]);

    useEffect(() => {
        console.log("selectedEvent", selectedEvent)
    }, [selectedEvent])

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
                                              });
                                          }

                                      }}
                />

                {(lessons || courses) &&
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
                        doubleClickAction: (eventId) => {
                            actions.openEventEditor({eventId: eventId});
                        },
                        deleteAction: (id) => {
                            actions.removeEvent(id);
                            timeline.Id && actions.getOneTimeline(timeline.Id); //TODO maybe dont need to check timelineId
                        },
                        createAction: () => {
                            const timelineId = timeline.Id ? timeline.Id : null;
                            actions.openEventEditor({timelineId: timelineId});
                        },
                        // openFindFormAction: () => {
                        //
                        // },
                        // findElementAction: (elData) => {
                        //     actions.findEvent(elData);
                        // },
                        openFindFormAction: () => {
                            setFinderFormOpened(true);
                        }
                    }
                    , periods: {
                        headerClickAction: () => {
                        },
                        doubleClickAction: () => {
                        },
                        deleteAction: () => {
                        },
                        createAction: () => {
                        }
                    }
                }} events={timeline.Events} periods={timeline.Periods} findedEl={findedEvents}/>
            </React.Fragment>
            }

            {(eventEditorOpened && timelinesAll) &&
            <Modal WrappedComponent={EventForm} wrappedProps={{
                eventData: selectedEvent,
                closeModalCb: closeModal,
                timelines: timelinesAll,
                timelineId: timeline.Id,
                onSave: (eventId, values) => {
                    console.log('onSave!')
                    console.log(values)
                    if (eventId) {
                        actions.updateEventData({eventId: eventId, eventData: values})
                    } else {
                        actions.createNewEvent(values)
                    }
                }}}/>
            }

            {finderFormOpened && <Modal WrappedComponent={EventsFindForm}
                                        commonHeader={true}
                                        closeAction={() => {
                                            (timeline && timeline.Id) && actions.getOneTimeline({id: timeline.Id});
                                            setFinderFormOpened(false);
                                        }}
                                        wrappedProps={{
                findedData: findedEvents,
                addEventsAction: (eventsData) => {
                    eventsData.forEach(id => actions.linkEvent({eventId: id, timelineId: timeline.Id}));
                },
                findAction: (elData) => {
                    console.log('find event')
                    actions.findEvent(elData);
                },
                closeAction: () => {
                    (timeline && timeline.Id) && actions.getOneTimeline({id: timeline.Id});
                    setFinderFormOpened(false);
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
        findedEvents: findedEventsSelector(state)
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
            removeEvent
            //todo add actions
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(TimelineEditorContainer)

