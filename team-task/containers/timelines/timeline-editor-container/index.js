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
import {getAllLessons, lessonsSelector} from "../../../ducks/dictionary";
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
    updateEventData
} from "tt-ducks/events-timeline";
import {useLocation,} from "react-router-dom"
import Modal from "../../../components/events/modal"
import EventForm from "../../../components/events/form"
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
    TypeOfUse: 2
};

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
    // const [periods, setPeriods] = useState([]); //todo finish for periods, remove it
    const [events, setEvents] = useState([]);
    const detailsEditor = useRef(null);
    const finderForm = useRef(null);
    // const [detailsEditor, setDetailsEditor] = useState(null)
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
        console.log('temporary events changed: , ', temporaryEvents)
    }, [temporaryEvents])

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
    }, [selectedEvent]);

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
                                      onSave={(timelineFormData) => {
                                          console.log('timelineFormData:', timelineFormData);
                                          console.log('changedValues:', changedValues);

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
                                              actions.createNewTimeline({...timeline,
                                                      Name: timelineFormData.name,
                                                      CourseId: changedValues.courseId,
                                                      LessonId: changedValues.lessonId,
                                                      TypeOfUse: changedValues.typeOfUse,
                                                      Order: changedValues.orderNumber,
                                                      Image: changedValues.image
                                                  },
                                                  true,
                                                  temporaryEvents && temporaryEvents.length > 0 ? temporaryEvents : [],
                                                  temporaryPeriods && temporaryPeriods.length > 0 ? temporaryPeriods : []);

                                              // if(temporaryEvents && temporaryEvents.length > 0){
                                              // (temporaryEvents && temporaryEvents.length > 0) && actions.createEvents(
                                              //     {
                                              //         events: temporaryEvents,
                                              //         timelineId: (timeline && timeline.Id) ? timeline.Id : null
                                              //     });

                                              // (temporaryPeriods && temporaryPeriods.length > 0) && actions.createPeriods( //todo uncomment after creating method createPeriods in duck
                                              //     {
                                              //         events: temporaryEvents,
                                              //         timelineId: (timeline && timeline.Id) ? timeline.Id : null
                                              //     });
                                          }
                                          // actions.setTemporaryEvents(null);
                                          // actions.clearSelectedTimeline();
                                          actions.goBack();

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
                            detailsEditor.current = EventForm;
                            actions.openEventEditor({eventId: eventId});
                        },
                        deleteAction: (id) => {
                            id && actions.removeEvent(id);
                            // !id && actions.setTemporaryEvents([# new_temporary_array #])//todo remove from temporary by....choise the field to identify
                            timeline.Id && actions.getOneTimeline(timeline.Id);
                        },
                        createAction: () => {
                            detailsEditor.current = EventForm;
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
                            finderForm.current = EventsFindForm;
                            // detailsEditor.current = EventsFindForm;
                            setFinderFormOpened(true);
                        }
                    }
                    , periods: {
                        headerClickAction: () => {
                        },
                        doubleClickAction: (periodId) => {
                            // detailsEditor.current = PeriodForm; todo create it
                            actions.openPeriodEditor({periodId: periodId});
                        },
                        deleteAction: (id) => {
                            actions.removePeriod(id);
                            timeline.Id && actions.getOneTimeline(timeline.Id);
                        },
                        createAction: () => {
                            // detailsEditor.current = PeriodForm;// todo create it
                            const timelineId = (timeline && timeline.Id) ? timeline.Id : null;
                            actions.openPeriodEditor({timelineId: timelineId});
                        },
                        openFindFormAction: () => {
                            // finderForm.current = PeriodsFindForm//todo create it
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
                                    State: 1
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
                                actions.setTemporaryPeriods([...prds, {...values}])
                            }

                        }
                    }

                    actions.toggleEditorTo(false);
                    actions.toggleEditorToPeriod(false);

                    // if(detailsEditor.current !== null) {
                    //     if(detailsEditor.current === Event)
                    // }
                    // console.log('onSave!')
                    // console.log(values)

                }
            }}/>
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
        findedEvents: findedEventsSelector(state),
        periods: periodsSelector(state),
        periodEditorOpened: periodEditorOpenedSelector(state),
        selectedPeriod: currentPeriodSelector(state),
        findedPeriods: findedPeriodsSelector(state),
        temporaryEvents: temporaryEventsSelector(state),
        temporaryPeriods: temporaryPeriodsSelector(state)

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
            //todo add actions
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(TimelineEditorContainer)

