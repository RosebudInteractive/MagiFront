import React from "react";
import PropTypes from "prop-types";
import history from '../../../history'
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {moveDown, moveUp, remove, select} from '../../../actions/lesson/lessonMainEpisodesActions'
import {enableButtonsSelector} from "adm-ducks/app";

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
                      data={this.props.episodes}
                      disabled={!this.props.enableButtons}/>
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
            {id: 'Number', header: '#', width: 30, sort: 'int'},
            {id: 'Name', header: ['Название', {content:"textFilter"}], fillspace: true, sort: 'text'},
            {
                id: 'State', header: ['Состояние', {content:"selectFilter"}], width: 90, editor: 'select', sort: 'text',
                options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]
            },
            {id: 'LanguageName', header: 'Язык курса', width: 90, sort: 'text'},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        episodes: state.lessonMainEpisodes.current,
        selected: state.lessonMainEpisodes.selected,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({select, remove, moveUp, moveDown}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodesGrid);
