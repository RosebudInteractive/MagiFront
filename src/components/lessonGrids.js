import GridControl from './gridControl';

export class LessonEpisodes extends GridControl{
    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Name', header: 'Название', fillspace: true},
            {id: 'State', header: 'Состояние', width: 90, editor: 'select',
                options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]},
            {id: 'LanguageName', header: 'Язык курса', width: 90},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

export class LessonReferences extends GridControl{
    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Description', header: 'Описание', fillspace: true},
            {id: 'URL', header: 'URL', width: 120},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}