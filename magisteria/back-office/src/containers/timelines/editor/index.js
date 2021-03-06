import React, {useEffect, useRef, useState} from "react";
import {hideSideBarMenu, showSideBarMenu} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import './timeline-editor-container.sass'
import TimelineHeader, {EDITOR_NAME as HEADER_EDITOR_NAME} from "../../../components/timelines/editor";
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
    updateTimeline,
} from "tt-ducks/timelines";
import {allCoursesSelector, getAllLessons, lessonsSelector} from "tt-ducks/dictionary";
import {
    addTemporaryEvent,
    cleanFound as cleanFoundEvents,
    closeEditorWithConfirmation as closeEventWithConfirmation,
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
    toggleEditorTo,
    updateEventData
} from "tt-ducks/events-timeline";
import {Prompt, useLocation,} from "react-router-dom"
import Modal from "../../../components/modal"
import EventForm from "../../../components/timelines/details/events/form"
import PeriodForm from "../../../components/timelines/details/periods/form"
import ScriptCommandForm from "../../../components/timelines/details/script/command-form"
import PeriodsFindForm from "../../../components/timelines/details/periods/find-form";
import EventsFindForm from "../../../components/timelines/details/events/find-form";

import {
    addTemporaryPeriod,
    cleanFound as cleanFoundPeriods,
    closeEditorWithConfirmation as closePeriodWithConfirmation,
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
    toggleEditorTo as toggleEditorToPeriod,
    updatePeriodData
} from "tt-ducks/periods-timeline";
import {getFormValues, isDirty} from "redux-form";
import {
    closeCommandEditorWithConfirmation,
    commandEditorOpenedSelector,
    commandsSelector,
    createNewCommand,
    currentCommandSelector,
    openCommandEditor,
    removeCommand,
    requestCommands,
    toggleCommandEditor,
    updateCommandData
} from "tt-ducks/script-commands-timeline";

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
        courses, selectedEvent, selectedCommand, eventEditorOpened,
        selectedPeriod, findedPeriods,
        timelinesAll, findedEvents, periodEditorOpened
        , events, periods, commands, commandEditorOpened
    } = props;
    const [timeline, setTimeline] = useState(null);
    const [levels, setLevels] = useState({events: 3, periods: 3});
    const [minLineWidth, setMinLineWidth] = useState(1000);
    const detailsEditor = useRef(null);
    const detailsTitle = useRef(null);
    const finderForm = useRef(null);
    const [finderFormOpened, setFinderFormOpened] = useState(false);
    const location = useLocation();

    const closeModal = (withConfirmation) => {
        if (withConfirmation) {
            periodEditorOpened && actions.closePeriodWithConfirmation();
            eventEditorOpened && actions.closeEventWithConfirmation();
            commandEditorOpened && actions.closeCommandEditorWithConfirmation();
        } else {
            actions.toggleEditorToPeriod(false);
            actions.toggleEditorTo(false);
            actions.toggleCommandEditor(false);
        }
    };

    const doubleClickAction = function ({id, type, optionalParam}) {
        if (id && type) {

            switch (type) {
                case 'periods':
                    detailsEditor.current = PeriodForm;
                    detailsTitle.current = 'period';
                    if (sTimeline.Periods && sTimeline.Periods.length > 0 && sTimeline.Periods.find(pr => (pr.Id) && pr.Id === id)) {
                        const periodToSet = sTimeline.Periods.find(pr => pr.Id === id);
                        actions.openPeriodEditor({periodId: id, period: periodToSet, timelineId: sTimeline.Id});
                    } else {
                        actions.openPeriodEditor({periodId: id});
                    }
                    break;
                case 'events':
                    detailsEditor.current = EventForm;
                    detailsTitle.current = 'event';

                    if (sTimeline.Events && sTimeline.Events.length > 0 && sTimeline.Events.find(pr => (pr.Id) && pr.Id === id)) {
                        actions.openEventEditor({eventId: id, timelineId: sTimeline.Id});
                    } else {
                        actions.openEventEditor({eventId: id});
                    }
                    break;
                case 'commands':
                    detailsEditor.current = ScriptCommandForm;
                    detailsTitle.current = 'command';

                    if (sTimeline.Commands && sTimeline.Commands.length > 0 && sTimeline.Commands.find(cmd => (cmd.Id) && cmd.Id === id)) {
                        actions.openCommandEditor({commandId: id, timelineId: sTimeline.Id});
                    }
                    break;
                default:
                    return;
            }
        } else {
            if (!id && type) {
                if(type === 'commands'){
                } else {
                    if (type === 'periods') {
                        detailsEditor.current = PeriodForm;
                        actions.openPeriodEditor({tableId: optionalParam.row});
                    } else {
                        detailsEditor.current = EventForm;
                        actions.openEventEditor({tableId: optionalParam.row});
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (sTimeline) {
            sTimeline.Events = events;
            sTimeline.Periods = periods;
            sTimeline.Commands = commands;
        }

    }, [events, periods, commands]);

    const onSave = (values) => {
        const _object = {
            SpecifCode: timeline.SpecifCode,
            State: +timeline.State,
            Name: values.Name,
            TypeOfUse: values.TypeOfUse,
            Options: {
                events: +values.EventLevel,
                periods: +values.PeriodLevel,
                periodsOverAxis: values.PeriodsOverAxis,
                minLineWidth: +values.MinLineWidth
            }
        };

        if (values.Order !== null) {
            _object.Order = +values.Order
        }

        if (values.Image && values.Image.file && values.Image.meta) {
            _object.Image = values.Image.file
            _object.ImageMeta = values.Image.meta
        }

        if (values.TypeOfUse === 1) {
            _object.CourseId = values.CourseId
            _object.LessonId = null
        }

        if (values.TypeOfUse === 2) {
            _object.CourseId = null
            _object.LessonId = values.LessonId
        }

        if (timeline.Id) {
            actions.updateTimeline(timeline.Id, _object);
        } else {
            actions.createNewTimeline(_object, true, events, periods)
        }

        actions.setTemporaryEvents([]);
        actions.setTemporaryPeriods([]);
        actions.getTimelines();
    };

    const detailsCreateAction = (type) => {
        const timelineId = timeline.Id ? timeline.Id : null;

        switch (type) {
            case 'events':
                detailsEditor.current = EventForm;
                detailsTitle.current = 'event';
                actions.openEventEditor({timelineId: timelineId});
                break;
            case 'periods':
                detailsEditor.current = PeriodForm;
                detailsTitle.current = 'period';
                actions.openPeriodEditor({timelineId: timelineId});
                break;
            case 'script':
                detailsEditor.current = ScriptCommandForm;
                detailsTitle.current = 'command';
                actions.openCommandEditor({timelineId: timelineId});
                break;
            default:
                return;
        }
    };

    const detailsOpenFindFormAction = (type) => {
        finderForm.current = type === 'events' ? EventsFindForm : PeriodsFindForm;
        setFinderFormOpened(true);
    };

    const onLevelsChanged = (value) => {
        setLevels({...levels, ...value})
    };

    const onSaveModal = ({id, tableId, values}) => {
        if (eventEditorOpened) {
            if (id) {
                actions.updateEventData({eventId: id, eventData: values})
            } else {
                if(!id && tableId){
                    actions.updateEventData({tableId: id, eventData: values})
                } else {
                    if (timeline && timeline.Id) {
                        actions.createNewEvent({...values, TlCreationId: timeline.Id});
                    } else {
                        actions.addTemporaryEvent({...values, State: 1})
                    }
                }

            }
        }

        if (periodEditorOpened) {
            if (id) {
                actions.updatePeriodData({periodId: id, periodData: values})
            } else {
                if (!id && tableId) {
                    actions.updatePeriodData({tableId: id, periodData: values})
                } else {
                    if (timeline && timeline.Id) {
                        actions.createNewPeriod({...values, TlCreationId: timeline.Id})
                    } else {
                        actions.addTemporaryPeriod({...values, State: 1})
                    }
                }
            }
        }

        if(commandEditorOpened){
            if (id) {
                actions.updateCommandData({commandId: id, commandData: values});
            } else {
                if (!id && tableId) {
                    actions.updatePeriodData({tableId: id, periodData: values})
                } else {
                    if (timeline && timeline.Id) {
                        actions.createNewCommand(values)
                    }
                }
            }
        }
    };

    const addElementsAction = (data, type) => {
        if (type === 'events') {
            if (timeline && timeline.Id) {
                data.forEach(id => actions.linkEvent({
                    eventId: id,
                    timelineId: timeline.Id
                }));
            } else {
                actions.addTemporaryEvent({...data});
            }
        } else {
            if (timeline && timeline.Id) {
                data.forEach(id => actions.linkPeriod({
                    periodId: id,
                    timelineId: timeline.Id
                }));
            } else {
                actions.addTemporaryPeriod(data);
            }
        }

        closeFinderAction();
    };

    const findAction = (elData) => {
        finderForm.current === PeriodsFindForm ?
            actions.findPeriod(elData, timeline.Id) :
            actions.findEvent(elData, timeline.Id);
    };

    const closeFinderAction = () => {
        setFinderFormOpened(false);
        actions.cleanFoundEvents();
        actions.cleanFoundPeriods();
        finderForm.current = null
    };

    useEffect(() => {
        const search = parseInt(location.pathname.split("/timelines/")[1]);

        if (search) {
            actions.getOneTimeline({id: search});
        }

        (!timelinesAll || timelinesAll.length === 0) && actions.getTimelines();
    }, [location]);

    useEffect(() => {
        sTimeline = selectedTimeline;
        setTimeline(selectedTimeline.hasOwnProperty('State') ? selectedTimeline : DEFAULT_TIMELINE);
    }, [selectedTimeline]);


    useEffect(() => {
        if (timeline && timeline.hasOwnProperty('State')) {
            const options = timeline.Options;
            if(options){
                setLevels({events: options.events, periods: options.periods});
                setMinLineWidth(options.minLineWidth || 1000);
            }
            (!lessons || lessons.length === 0) && actions.getAllLessons(true, false); // todo return this string if behaviour seems to be broken
            // (!lessons || lessons.length === 0) && actions.getAllLessons(true, false); // todo for courses, why it still here but all works fine?!? (but its no vision about where getiign the courses)
        }
    }, [timeline, lessons, courses]);


    useEffect(() => {
        return function () {
            setTemporaryEvents([]);
            setTemporaryPeriods([]);
        }
    }, []);

    return <div className="timeline-editor-container form">
            {
                timeline && timeline.State &&
                <React.Fragment>
                    <Prompt when={props.hasChanges}
                            message={'???????? ?????????????????????????? ????????????.\n ?????????????? ?????? ?????????????????????'}/>
                    <TimelineHeader timeline={timeline}
                                    lessons={lessons}
                                    courses={courses}
                                    onSave={onSave}
                                    onLevelsChanged={onLevelsChanged}
                                    onMinLineWidthChanged={(val) => setMinLineWidth(val)}/>
                    <TimelinePreview background={props.editorValues && props.editorValues.Image}
                                     timeline={timeline}
                                     levels={levels}
                                     minLineWidth={minLineWidth}/>
                    <TimelineDetails actions={{
                        events: {
                            headerClickAction: () => { },
                            doubleClickAction: (id, tableId = null) => doubleClickAction({
                                id: id,
                                type: 'events',
                                optionalParam: tableId
                            }),
                            deleteAction: (id) => { (id && (sTimeline && sTimeline.Id)) && actions.removeEvent(id, sTimeline.Id) },
                            createAction: () => { detailsCreateAction('events') },
                            openFindFormAction: () => { detailsOpenFindFormAction('events') }
                        },
                        periods: {
                            headerClickAction: () => { },
                            doubleClickAction: (id, tableId = null) => doubleClickAction({
                                id: id,
                                type: 'periods',
                                optionalParam: tableId
                            }),
                            deleteAction: (id) => { (id && (sTimeline && sTimeline.Id)) && actions.removePeriod(id, sTimeline.Id) },
                            createAction: () => { detailsCreateAction('periods') },
                            openFindFormAction: () => { detailsOpenFindFormAction('periods') }
                        },
                        script: {
                            deleteAction: (id) => { (id && (sTimeline && sTimeline.Id)) && actions.removeCommand(id) },
                            createAction: () => { detailsCreateAction('script') },
                            doubleClickAction: (id, tableId = null) => doubleClickAction({
                                id: id,
                                type: 'commands',
                                optionalParam: tableId
                            }),
                        }
                    }}
                                     events={events}
                                     periods={periods}
                                     scriptTimecodes={commands}
                                     findedEvents={findedEvents}
                                     findedPeriods={findedPeriods}
                                     timelineId={timeline.Id}
                                     disabled={(!(timeline && timeline.Id) || (props.hasChanges))}/>
                </React.Fragment>
            }

            {
                ((eventEditorOpened || periodEditorOpened || commandEditorOpened) && timelinesAll && detailsEditor.current) &&
                <Modal WrappedComponent={detailsEditor.current}
                       customHeader={true}
                       wrappedProps={{
                           eventData: selectedEvent,
                           periodData: selectedPeriod,
                           commandData: selectedCommand,
                           events: events,
                           periods: periods,
                           closeModalCb: closeModal,
                           timelines: timelinesAll,
                           timelineId: timeline.Id,
                           onSave: onSaveModal
                       }}/>
            }

            {
                finderFormOpened &&
                <Modal WrappedComponent={finderForm.current}
                       title={finderForm.current === PeriodsFindForm ? "???????????????????? ??????????????" : "???????????????????? ??????????????"}
                       closeAction={closeFinderAction}
                       wrappedProps={{
                           findedData: finderForm.current === PeriodsFindForm ? findedPeriods : findedEvents,
                           addEventsAction: (data) => {addElementsAction(data, 'events')},
                           addPeriodsAction: (data) => {addElementsAction(data, 'periods')},
                           findAction: findAction,
                           closeAction: closeFinderAction
                       }}/>
            }
        </div>
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
        courses: allCoursesSelector(state),
        editorValues: getFormValues(HEADER_EDITOR_NAME)(state),
        hasChanges: isDirty(HEADER_EDITOR_NAME)(state),
        selectedCommand: currentCommandSelector(state),
        commandEditorOpened: commandEditorOpenedSelector(state),
        commands: commandsSelector(state)
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
            closePeriodWithConfirmation,
            closeEventWithConfirmation,
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
            addTemporaryEvent,
            addTemporaryPeriod,
            setTemporaryEvents,
            setTemporaryPeriods,
            createEvents,
            clearSelectedTimeline,
            cleanFoundPeriods,
            cleanFoundEvents,
            requestCommands,
            openCommandEditor,
            closeCommandEditorWithConfirmation,
            createNewCommand,
            updateCommandData,
            removeCommand,
            toggleCommandEditor
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(TimelineEditorContainer)

