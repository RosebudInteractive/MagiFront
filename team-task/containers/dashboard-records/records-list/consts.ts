import {getProcessState} from './functions';
import {Dashboard} from '../../../@types/dashboard';

export const MAIN_COLUMNS = [
  { id: 'Week', header: [{ text: 'Неделя', css: 'up-headers' }], css: 'week-up' },
  {
    id: 'PubDate',
    css: 'js-change-date',
    header: [{ text: 'Дата', css: 'up-headers' }],
    width: 90,
    template(val: Dashboard.Record): string {
      const needShowPubDate: boolean = !!val.PubDate && (val.PubDate.length > 0);

      if (needShowPubDate) {
        const pubDate = val.PubDate.split(' ');
        const day = pubDate[0];
        const month = pubDate[1];
        const dayOfWeek = pubDate[2];

        return `<div class="pubdate-cell ${val.IsWeekend ? 'weekend' : ''}">${day} ${month}<div >${dayOfWeek}</div></div>`;
      }
      return '';
    },

  },
  {
    id: 'LessonNum',
    header: [{ text: '№', css: 'up-headers' }],
    css: '_container up-aligned-flex',
    width: 50,
    template(val: Dashboard.Record) {
      return `<div >${val.LessonNum}</div>`;
    },
  },
  {
    id: 'CourseLessonName',
    header: '<div class="doubled-aligned">Курс <br/> Название лекции</div>',
    minWidth: 100,
    css: '_container doubled-ceil',
    fillspace: true,
    template(data: Dashboard.Record) {
      return data && data.CourseLessonName ? `<div  class="course-lesson-name-ceil">
                        <div class="course-name">
                            ${data.CourseLessonName[0] ? data.CourseLessonName[0] : ''}                   
                        </div>
                        <div class="lesson-name">
                            ${data.CourseLessonName[1] ? data.CourseLessonName[1] : ''}       
                        </div>
                   </div>` : '';
    },
  },
  { id: 'CourseName', header: [{ text: 'Курс', css: 'up-headers' }], hidden: true },
  { id: 'LessonName', header: [{ text: 'Название лекции', css: 'up-headers' }], hidden: true },
];

export const STATE_COLUMNS = [
  // { todo dont remove this - maybe it will use in future
  //   id: 'IsPublished',
  //   header: [{ text: 'Опубликовано', css: 'up-headers' }],
  //   css: '_container up-aligned',
  //   template(data: Dashboard.Record) {
  //     return `<div class='${'is-published'} ${data.IsPublished ? 'published-ok' : ''}'>
  //                       </div>`;
  //   },
  // },
  {
    id: 'ProcessState',
    header: [{ text: 'Процесс', css: 'up-headers' }],
    css: '_container process-state-aligned js-open-process',
    template(val: Dashboard.Record) {
      const state = getProcessState(val.ProcessState);
      return `<div class="centered-by-flex process-state ${state.css}">${state.label}</div>`;
    },
  },
  {
    id: 'options-menu',
    header: '',
    width: 50,
    css: '_container',
    template() {
      return "<button class='options-menu js-toggle-menu'/>";
    },
  },
];
