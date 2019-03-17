import GridControl from "../../gridControl";

export default class LessonReferences extends GridControl {

    _getId() {
        return 'lesson-refs';
    }

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
