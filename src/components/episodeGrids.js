import GridControl from './gridControl';

export class EpisodeToc extends GridControl{
    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Topic', header: 'Название', fillspace: true},
            {id: 'StartTime', header: 'Метка времени', width: 200,},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

export class EpisodeContent extends GridControl{
    _getColumns() {
        let _columns = [
            {id: 'FileId', header: 'FileId', width: 120,},
            {id: 'Name', header: 'Название', fillspace: true, width: 300, },
            {id: 'StartTime', header: 'Время начала', width: 90},
            {id: 'Duration', header: 'Длительность', width: 90,},
            // {id: 'FileName', header: 'Файл', width: 300,},
            {
                id: 'CompType',
                header: 'Тип',
                width: 150,
                editor: 'select',
                options: [
                    {id: 'PIC', value: 'Изображение'},
                    {id: 'VDO', value: 'Видео'},
                    {id: 'TXT', value: 'Текст'},
                    {id: 'TLN', value: 'Таймлайн'},
                ]
            },
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}