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

export class LessonSubLessons extends GridControl{
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

export class LessonResources extends GridControl{
    _getColumns() {
        let _columns = [
            {id: 'FileId', header: 'FileId', width: 60,},
            {id: 'Name', header: 'Название', width: 300,},
            {id: 'Description', header: 'Описание', fillspace: true, },
            // {id: 'FileName', header: 'Имя файла', width: 250},
            // {id: 'Language', header: 'Язык', width: 90},
            // {id: 'ResType', header: 'Тип ресурса', width: 150, editor: 'select',
            //     options: [{id: 'P', value: 'Изображение'}, {id: 'V', value: 'Видео'},]},
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