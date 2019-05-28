import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {EDIT_MODE_EDIT} from "../../../constants/Common";
import {enableButtonsSelector} from "adm-ducks/app";
import * as contentActions from "../../../actions/content-actions";
import EpisodeResourceForm from "../../episode-content-form";
import * as episodeContentActions from "../../../actions/episode/episode-contents-actions";

class TocGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        lessonId: PropTypes.number,
    }

    constructor(props) {
        super(props)

        this.state = {
            showDialog: false,
        }
    }

    render() {

        return <div className="episode-content">
            <EpisodeContent selectAction={::this.props.episodeContentActions.select}
                            createAction={::this._create}
                            editAction={::this._edit}
                            removeAction={::this.props.episodeContentActions.remove}
                            moveUpAction={::this.props.episodeContentActions.moveUp}
                            moveDownAction={::this.props.episodeContentActions.moveDown}
                            editMode={this.props.editMode}
                            selected={this.props.selected}
                            data={this.props.content}
                            disabled={!this.props.enableButtons}/>
            {
                this.state.showDialog ?
                    <EpisodeResourceForm
                        cancel={::this._cancel}
                        save={::this._save}
                        data={this.props.contentItem}
                        lessonId={this.props.lessonId}
                    />
                    :
                    null
            }
        </div>

    }

    _create() {
        this.props.contentActions.create()
        this.setState({showDialog: true})
    }

    _edit(id) {
        let _contentItem = this.props.content.find(item => item.id === +id);

        this.props.contentActions.edit(_contentItem);
        this.setState({showDialog: true})
    }

    _save(value) {
        if (this.props.resourceEditMode === EDIT_MODE_EDIT) {
            this.props.episodeContentActions.update(value)
        } else {
            this.props.episodeContentActions.insert(value);
        }

        this.props.contentActions.clear();
        this.setState({showDialog: false})
    }

    _cancel() {
        this.setState({showDialog: false})
        this.props.contentActions.clear();
    }
}


class EpisodeContent extends GridControl {

    _getId() {
        return 'episode-content';
    }

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

function mapStateToProps(state) {
    return {
        content: state.episodeContent.current,
        selected: state.episodeContent.selected,
        contentItem: state.content.object,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        contentActions: bindActionCreators(contentActions, dispatch),
        episodeContentActions: bindActionCreators(episodeContentActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TocGrid);