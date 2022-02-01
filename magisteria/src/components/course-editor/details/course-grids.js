import GridControl from '../../gridControl';

export class CourseAuthors extends GridControl{

    _getId() {
        return 'course-authors';
    }

    _getColumns() {
        let _columns = [
            {id: 'FirstName', header: 'Имя', width: 100, sort: 'text'},
            {id: 'LastName', header: 'Фамилия', fillspace: true, sort: 'text'}
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

export class CourseCategories extends GridControl {

    _getId() {
        return 'course-categories';
    }

    _getColumns() {
        let _columns = [
            {id: 'Name', header: 'Имя', fillspace: true, sort: 'text'},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

export class CourseLessons extends GridControl{

    _getId() {
        return 'course-lessons';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30, sort: 'int'},
            {id: 'Name', header: ['Название', {content:"textFilter"}], fillspace: true, sort: 'text'},
            {id: 'State', header: ['Состояние', {content:"selectFilter"}], width: 90, editor: 'select', sort: 'text',
                options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]},
            {id: 'LanguageName', header: 'Язык курса', width: 90, sort: 'text'},
            {id: 'ReadyDate', header: 'Дата готовности', width: 120, format: this._formatDate, sort: 'date'},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}
