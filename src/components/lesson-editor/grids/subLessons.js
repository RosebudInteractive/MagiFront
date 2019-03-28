import React from "react";
import PropTypes from "prop-types";
import history from '../../../history'
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {select, remove,} from '../../../actions/subLessonsActions'

class SublessonsGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    render() {

        return <div className="lesson-episodes">
            <label className="grid-label">Дополнительные лекции</label>
            <SubLessons selectAction={::this.props.select}
                        createAction={::SublessonsGrid._create}
                        editAction={::SublessonsGrid._edit}
                        removeAction={::this.props.remove}
                        selected={this.props.selected}
                        editMode={this.props.editMode}
                        data={this.props.subLessons}/>
        </div>

    }

    _select(id) {
        this.props.lessonMainEpisodesActions.select(id)
    }

    static _create() {
        // history.push(window.location.pathname + '/episodes/new')
    }

    static _edit(id) {
        history.push(window.location.pathname + '/sub-lessons/edit/' + id)
    }
}

class SubLessons extends GridControl {

    _getId() {
        return 'lesson-subs';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Name', header: 'Название', fillspace: true},
            {
                id: 'State', header: 'Состояние', width: 90, editor: 'select',
                options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]
            },
            {id: 'LanguageName', header: 'Язык курса', width: 90},
            {id: 'ReadyDate', header: 'Дата готовности', width: 120, format: this._formatDate,},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        subLessons: state.subLessons.current,
        selected: state.subLessons.selected,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({select, remove,}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SublessonsGrid);