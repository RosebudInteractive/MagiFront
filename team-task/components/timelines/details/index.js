import React, {useState} from "react";
import './details.sass'
import {EVENT_STATES} from "../../../constants/events"
import DetailsList from "./list";
import {TIMELINE_STATE} from "../../../constants/states";
import {Nav} from 'rsuite';

//todo finish this, maybe use scriptTimestamps instead of scriptTimecodes ??
export default function TimelineDetails(props) {
    const {events, periods, actions, findedEvents, findedPeriods, timelineId, disabled, scriptTimecodes} = props;
    const [activeTabKey, setActiveTabKey] = useState('events');

    const TabContent = ({activeKey}) => {
        switch (activeKey) {
            case 'events':
                return  <DetailsList
                    disabled={disabled}
                    items={events ? events : []}
                    idGrid={'events-list'}
                    actions={actions.events}
                    title={'События'}
                    findedEl={findedEvents}
                    addCompletelyCreated={!!timelineId}
                    columnsConfig={[
                        {id: 'Id', header: 'Id', hidden: true},
                        {id: 'Name', header: 'Название', fillspace: true},
                        {id: 'DisplayDate', header: 'Дата события',  width: 80, adjust:true, css: "_centered"},
                        {id: 'State', header: 'Состояние',  width: 80, options: EVENT_STATES, template: function (val) {
                                const cssWithLabel = Object.values(TIMELINE_STATE).find(item => item.value === parseInt(val.State));
                                return `<div class="state-template-block font-body-s"><div class="state-circle ${cssWithLabel.css}"></div></div>`
                            }},
                        {
                            id: 'del-btn', header: '', width: 50,
                            template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"
                        },
                    ]}
                />;
            case 'periods':
                return <DetailsList
                    disabled={disabled}
                    idGrid={'periods-list'}
                    items={periods ? periods : []}
                    actions={actions.periods}
                    title={'Периоды'}
                    findedEl={findedPeriods}
                    addCompletelyCreated={!!timelineId}
                    columnsConfig={[
                        {id: 'Id', header: 'Id', hidden: true},
                        {id: 'Name', header: 'Название', fillspace: true},
                        {id: 'DisplayStartDate', header: 'Начало',  width: 80, adjust:true, css: "_centered"},
                        {id: 'DisplayEndDate', header: 'Конец',  width: 80, adjust:true, css: "_centered"},
                        {id: 'State', header: 'Состояние',  width: 80, options: EVENT_STATES,  template: function (val) {
                                const cssWithLabel = Object.values(TIMELINE_STATE).find(item => item.value === parseInt(val.State));
                                return `<div class="state-template-block font-body-s">
                                            <div class="state-circle ${cssWithLabel.css}"></div></div>`
                            }
                        },
                        {
                            id: 'del-btn', header: '', width: 50,
                            template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"
                        },
                    ]}
                />;
            case 'script':
                return <DetailsList
                    disabled={disabled}
                    idGrid={'script-timecode-list'}
                    items={scriptTimecodes ? scriptTimecodes : []} //todo pass it from an up-level component/s
                    actions={actions.script} //todo change to actions.scriptTimecodes
                    title={'Список таймкодов'}
                    findedEl={[]}
                    addCompletelyCreated={!!timelineId}
                    opportunityToAddCompletelyCreatedItems = {false}
                    columnsConfig={[
                        {id: 'Id', header: 'Id', hidden: true},
                        {id: 'Timecode', header: 'Таймкод', fillspace: true},
                        {id: 'Command', header: 'Команда',  width: 80, adjust:true, css: "_centered"},
                        {id: 'FirstArgumentName', header: 'Имя первого элемента',  width: 80, adjust:true, css: "_centered"},
                        // {id: 'State', header: 'Состояние',  width: 80, options: EVENT_STATES,  template: function (val) {
                        //         const cssWithLabel = Object.values(TIMELINE_STATE).find(item => item.value === parseInt(val.State));
                        //         return `<div class="state-template-block font-body-s">
                        //                     <div class="state-circle ${cssWithLabel.css}"></div></div>`
                        //     }
                        // },
                        {
                            id: 'del-btn', header: '', width: 50,
                            template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"
                        },
                    ]}
                />;
            default:
                return ''
        }
    };
    // useEffect(() => {
    //     console.log()
    // },[disabled]);

    return (
        <div className="timeline-details">

            <Nav activeKey={activeTabKey} appearance={"tabs"} onSelect={eventKey => {
                setActiveTabKey(eventKey);
            }} >
                <Nav.Item eventKey="events" >События</Nav.Item>
                <Nav.Item eventKey="periods">Периоды</Nav.Item>
                <Nav.Item eventKey="script">Скрипт</Nav.Item>
            </Nav>

            <TabContent activeKey={activeTabKey} />

            {/*<DetailsList*/}
            {/*    disabled={disabled}*/}
            {/*    items={events ? events : []}*/}
            {/*    idGrid={'events-list'}*/}
            {/*    actions={actions.events}*/}
            {/*    title={'События'}*/}
            {/*    findedEl={findedEvents}*/}
            {/*    addCompletelyCreated={!!timelineId}*/}
            {/*    columnsConfig={[*/}
            {/*        {id: 'Id', header: 'Id', hidden: true},*/}
            {/*        {id: 'Name', header: 'Название', fillspace: true},*/}
            {/*        {id: 'DisplayDate', header: 'Дата события',  width: 80, adjust:true, css: "_centered"},*/}
            {/*        {id: 'State', header: 'Состояние',  width: 80, options: EVENT_STATES, template: function (val) {*/}
            {/*            const cssWithLabel = Object.values(TIMELINE_STATE).find(item => item.value === parseInt(val.State));*/}
            {/*                return `<div class="state-template-block font-body-s"><div class="state-circle ${cssWithLabel.css}"></div></div>`*/}
            {/*            }},*/}
            {/*        {*/}
            {/*            id: 'del-btn', header: '', width: 50,*/}
            {/*            template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"*/}
            {/*        },*/}
            {/*    ]}*/}
            {/*/>*/}

            {/*<DetailsList*/}
            {/*    disabled={disabled}*/}
            {/*    idGrid={'periods-list'}*/}
            {/*    items={periods ? periods : []}*/}
            {/*    actions={actions.periods}*/}
            {/*    title={'Периоды'}*/}
            {/*    findedEl={findedPeriods}*/}
            {/*    addCompletelyCreated={!!timelineId}*/}
            {/*    columnsConfig={[*/}
            {/*        {id: 'Id', header: 'Id', hidden: true},*/}
            {/*        {id: 'Name', header: 'Название', fillspace: true},*/}
            {/*        {id: 'DisplayStartDate', header: 'Начало',  width: 80, adjust:true, css: "_centered"},*/}
            {/*        {id: 'DisplayEndDate', header: 'Конец',  width: 80, adjust:true, css: "_centered"},*/}
            {/*        {id: 'State', header: 'Состояние',  width: 80, options: EVENT_STATES,  template: function (val) {*/}
            {/*                const cssWithLabel = Object.values(TIMELINE_STATE).find(item => item.value === parseInt(val.State));*/}
            {/*                return `<div class="state-template-block font-body-s">*/}
            {/*                                <div class="state-circle ${cssWithLabel.css}"></div></div>`*/}
            {/*        }*/}
            {/*        },*/}
            {/*        {*/}
            {/*            id: 'del-btn', header: '', width: 50,*/}
            {/*            template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"*/}
            {/*        },*/}
            {/*    ]}*/}
            {/*/>*/}
        </div>
    )
}
