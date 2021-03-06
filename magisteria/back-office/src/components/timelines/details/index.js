import React, {useState} from "react";
import './details.sass'
import {EVENT_STATES} from "../../../constants/events"
import DetailsList from "./list";
import {TIMELINE_STATE} from "../../../constants/states";
import {Nav} from 'rsuite';
import {SCRIPT_COMMANDS} from "./script/command-form";

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
                    items={scriptTimecodes ? scriptTimecodes : []}
                    actions={actions.script}
                    title={'Список таймкодов'}
                    findedEl={[]}
                    addCompletelyCreated={!!timelineId}
                    opportunityToAddCompletelyCreatedItems = {false}
                    columnsConfig={[
                        {id: 'Id', header: 'Id', hidden: true},
                        {id: 'Timecode', header: 'Таймкод',  width: 80},
                        {id: 'Command', header: 'Команда',  width: 80, adjust:true, css: "_centered", format: function (value) {
                                return SCRIPT_COMMANDS.find(el => el.id === +value).name;
                            }},
                        {id: 'FirstArgumentName', header: 'Имя первого элемента',  fillspace: true, adjust:true},
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

        </div>
    )
}
