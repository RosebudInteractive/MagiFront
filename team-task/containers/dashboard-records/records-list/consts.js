export const defaultColumnConfigOne = [
    {
        id: 'Id', header: [{text: 'id', css: 'up-headers'}], hidden: true
    },
    {
        id: 'Week', header: [{text: 'Неделя', css: 'up-headers'}], css: 'week-up'
    },
    {
        id: 'PubDate', header: [{text: 'Дата', css: 'up-headers'}],
    },
    {
        id: 'CourseName', header: [{text: 'Курс', css: 'up-headers'}], minWidth: 130
    },
    {
        id: 'LessonNum', header: [{text: 'Номер', css: 'up-headers'}], css: '_container',
        template: function (val) {
            return `<div class="centered-by-flex">${val.LessonNum}</div>`;
        },
    },
    {
        id: 'LessonName', header: [{text: 'Название лекции', css: 'up-headers'}], minWidth: 130
    },
];
