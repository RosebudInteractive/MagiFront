import {getProcessState} from "./functions";

export const MAIN_COLUMNS = [
    { id: 'Id', header: [{text: 'id', css: 'up-headers'}], hidden: true },
    { id: 'Week', header: [{text: 'Неделя', css: 'up-headers'}], css: 'week-up' },
    { id: 'PubDate', header: [{text: 'Дата', css: 'up-headers'}], },
    { id: 'CourseName', header: [{text: 'Курс', css: 'up-headers'}], minWidth: 130, fillspace: 30 },
    {
        id: 'LessonNum', header: [{text: 'Номер', css: 'up-headers'}], css: '_container',
        template: function (val) {
            return `<div class="centered-by-flex">${val.LessonNum}</div>`;
        },
    },
    { id: 'LessonName', header: [{text: 'Название лекции', css: 'up-headers'}], minWidth: 130, fillspace: 30 },
];

export const STATE_COLUMNS = [
    {
        id: 'IsPublished', header: [{text: 'Опубликовано', css: 'up-headers'}],
        css: '_container',
        template: function (data) {
            return `<div class='${'check-box-block'} ${data.IsPublished ? 'checked' : ''}'>
                        <div class=${data.IsPublished ? 'check-mark' : ''}></div>
                        </div>`
        }
    },
    {
        id: 'ProcessState', header: [{text: 'Процесс', css: 'up-headers'}], width: 150, css: "_container",
        template: function (val) {
            const state = getProcessState(val.ProcessState);
            return `<div class="process-state ${state.css}">${state.label}</div>`;
        }
    }
]
