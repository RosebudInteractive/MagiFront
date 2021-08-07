import React from "react";
import './details.sass'
import {EVENT_STATES} from "../../../constants/events"
import DetailsList from "./list";
import {TIMELINE_STATE} from "../../../constants/states";

//todo finish this
export default function TimelineDetails(props) {
    const {events, periods, actions, findedEvents, findedPeriods, timelineId, disabled} = props;

    // useEffect(() => {
    //     console.log()
    // },[disabled]);

    return (
        <div className="timeline-details">
            <DetailsList
                disabled={disabled}
                items={events ? events : []}
                idGrid={'events-list'}
                actions={actions.events}
                title={'События'}
                findedEl={findedEvents}
                addCompletelyCreated={!!timelineId}
                columnsConfig={[
                    {id: 'Id', header: 'Id', hidden: true},
                    {id: 'Name', header: 'Название', minWidth: 80, fillspace: 24},
                    {id: 'ShortName', header: 'Краткое название',  minWidth: 80, fillspace: 24},
                    {id: 'DisplayDate', header: 'Дата события',  minWidth: 80, fillspace: 24},
                    {id: 'State', header: 'Состояние',  minWidth: 80, fillspace: 20, options: EVENT_STATES, template: function (val) {
                        const cssWithLabel = Object.values(TIMELINE_STATE).find(item => item.value === parseInt(val.State));
                            return `<div class="state-template-block font-body-s"><div class="state-circle ${cssWithLabel.css}"></div></div>`
                        }},
                    {
                        id: 'del-btn', header: '', width: 50, fillspace: 8,
                        template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"
                    },
                ]}
            />

            <DetailsList
                disabled={disabled}
                idGrid={'periods-list'}
                items={periods ? periods : []}
                actions={actions.periods}
                title={'Периоды'}
                findedEl={findedPeriods}
                addCompletelyCreated={!!timelineId}
                columnsConfig={[
                    {id: 'Id', header: 'Id', hidden: true},
                    {id: 'Name', header: 'Название', minWidth: 80, fillspace: 24},
                    {id: 'ShortName', header: 'Краткое название',  minWidth: 80, fillspace: 18},
                    {id: 'DisplayStartDate', header: 'Начало',  minWidth: 80, fillspace: 24},
                    {id: 'DisplayEndDate', header: 'Конец',  minWidth: 80, fillspace: 24},
                    {id: 'State', header: 'Состояние',  minWidth: 80, fillspace: 20, options: EVENT_STATES,  template: function (val) {
                            const cssWithLabel = Object.values(TIMELINE_STATE).find(item => item.value === parseInt(val.State));
                            return `<div class="state-template-block font-body-s">
                                            <div class="state-circle ${cssWithLabel.css}"></div></div>`
                    }
                    },
                    {
                        id: 'del-btn', header: '', width: 50, fillspace: 8,
                        template: "<button class='process-elements-grid__button elem-delete remove-event-button'/>"
                    },
                ]}
            />
        </div>
    )
}
