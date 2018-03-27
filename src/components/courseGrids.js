import GridControl from './gridControl';

export class CourseAuthors extends GridControl{
    _getColumns() {
        let _columns = [
            {id: 'FirstName', header: 'Имя', width: 100,},
            {id: 'LastName', header: 'Фамилия', fillspace: true,}
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

export class CourseCategories extends GridControl {
    _getColumns() {
        let _columns = [
            {id: 'Name', header: 'Имя', fillspace: true,},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

export class CourseLessons extends GridControl{
    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Name', header: 'Название', fillspace: true},
            {id: 'State', header: 'Состояние', width: 90, editor: 'select',
                options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]},
            {id: 'LanguageName', header: 'Язык курса', width: 90},
            {id: 'ReadyDate', header: 'Дата готовности', width: 120, format: this._formatDate,},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}