import React, {useEffect} from "react";
import './details.sass'
import {EVENT_STATES} from "../../../constants/events"
import DetailsList from "./list";

//todo finish this
export default function TimelineDetails(props) {
    const {events, periods, actions, findedEvents, findedPeriods, timelineId} = props;

    useEffect(() => {
        console.log('TimelineDetails events', events);
    }, [events]);

    return (
        <div className="timeline-details">
            <DetailsList
                items={events ? events : []}
                idGrid={'events-list'}
                actions={actions.events}
                title={'События'}
                findedEl={findedEvents}
                addCompletelyCreated={!!timelineId}
                columnsConfig={[
                    {id: 'Id', header: 'Id', hidden: true},
                    {id: 'Name', header: 'Название', minWidth: 80, fillspace: 18},
                    {id: 'ShortName', header: 'Краткое название',  minWidth: 80, fillspace: 18},
                    {id: 'Description', header: 'Описание',  minWidth: 80, fillspace: 18},
                    {id: 'Date', header: 'Дата события',  minWidth: 80, fillspace: 18, format: function(value) {
                            let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                            return value ? fn(new Date(value)) : '';
                        }},
                    {id: 'State', header: 'Состояние',  minWidth: 80, fillspace: 20,
                    options: EVENT_STATES},

                    {
                        id: 'del-btn', header: '', width: 50, fillspace: 8,
                        template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"
                    },
                ]}
            />

            <DetailsList
                idGrid={'periods-list'}
                items={periods ? periods : []}
                actions={actions.periods}
                title={'Периоды'}
                findedEl={findedPeriods}
                addCompletelyCreated={!!timelineId}
                columnsConfig={[
                    {id: 'Id', header: 'Id', hidden: true},
                    {id: 'Name', header: 'Название', minWidth: 80, fillspace: 18},
                    {id: 'ShortName', header: 'Краткое название',  minWidth: 80, fillspace: 18},
                    {id: 'Description', header: 'Описание',  minWidth: 80, fillspace: 18},
                    {id: 'StartDate', header: 'Начало',  minWidth: 80, fillspace: 18, format: function(value) {
                            let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                            return value ? fn(new Date(value)) : '';
                        }},
                    {id: 'EndDate', header: 'Конец',  minWidth: 80, fillspace: 18, format: function(value) {
                            let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                            return value ? fn(new Date(value)) : '';
                        }},
                    {id: 'State', header: 'Состояние',  minWidth: 80, fillspace: 20,
                        options: EVENT_STATES},

                    {
                        id: 'del-btn', header: '', width: 50, fillspace: 8,
                        template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"
                    },
                ]}
            />
        </div>
    )
}
