import React from "react";
import PropTypes from "prop-types";
import history from '../../../history'
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {select, remove, moveUp, moveDown} from '../../../actions/lesson/lessonMainEpisodesActions'

class EpisodesGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    render() {

        return <div className="lesson-episodes">
            <label className="grid-label">Эпизоды</label>
            <Episodes selectAction={::this.props.select}
                      createAction={::EpisodesGrid._create}
                      editAction={::EpisodesGrid._edit}
                      removeAction={::this.props.remove}
                      moveUpAction={::this.props.moveUp}
                      moveDownAction={::this.props.moveDown}
                      selected={this.props.selected}
                      editMode={this.props.editMode}
                      data={this.props.episodes}/>
        </div>

    }

    _select(id) {
        this.props.lessonMainEpisodesActions.select(id)
    }

    static _create() {
        history.push(window.location.pathname + '/episodes/new')
    }

    static _edit(episodeId) {
        history.push(window.location.pathname + '/episodes/edit/' + episodeId)
    }
}

class Episodes extends GridControl {

    _getId() {
        return 'lesson-episodes';
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
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        episodes: state.lessonMainEpisodes.current,
        selected: state.lessonMainEpisodes.selected,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({select, remove, moveUp, moveDown}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodesGrid);