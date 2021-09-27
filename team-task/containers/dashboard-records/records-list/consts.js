import {getProcessState} from "./functions";

export const MAIN_COLUMNS = [
    {id: 'Week', header: [{text: 'Неделя', css: 'up-headers'}], css: 'week-up'},
    {id: 'PubDate', css: 'js-change-date', header: [{text: 'Дата', css: 'up-headers'}], width: 70},
    {
        id: 'LessonNum', header: [{text: '№', css: 'up-headers'}], css: '_container',
        width: 50,
        template: function (val) {
            return `<div class="centered-by-flex">${val.LessonNum}</div>`;
        },
    },
    {
        id: 'CourseLessonName', header: `<div class="doubled-aligned">Курс <br/> Название лекции</div>`, minWidth: 150,
        css: '_container doubled-ceil',
        fillspace: true,
        template: function (data) {
            return data && data.CourseLessonName ? `<div  class="course-lesson-name-ceil">
                        <div class="course-name">
                            ${data.CourseLessonName[0] ? data.CourseLessonName[0] : ''}                   
                        </div>
                        <div class="lesson-name">
                            ${data.CourseLessonName[1] ? data.CourseLessonName[1] : ''}       
                        </div>
                   </div>`  : '';
        }
    },
    {id: 'CourseName', header: [{text: 'Курс', css: 'up-headers'}], hidden: true},
    {id: 'LessonName', header: [{text: 'Название лекции', css: 'up-headers'}], hidden: true},
];

export const STATE_COLUMNS = [
    {
        id: 'IsPublished', header: [{text: 'Опубликовано', css: 'up-headers'}],
        css: '_container up-aligned',
        template: function (data) {
            return `<div class='${'is-published'} ${data.IsPublished ? 'published-ok' : ''}'>
                        </div>`
        }
    },
    {
        id: 'ProcessState', header: [{text: 'Процесс', css: 'up-headers'}], width: 120, css: "_container process-state-aligned",
        template: function (val) {
            const state = getProcessState(val.ProcessState);
            return `<div class="centered-by-flex process-state ${state.css}">${state.label}</div>`;
        }
    },
    {
        id: 'options-menu', header: '', width: 50, css: "_container",
        template: function(data){
            return "<button class='options-menu js-toggle-menu'/>"
        }
    },
]
