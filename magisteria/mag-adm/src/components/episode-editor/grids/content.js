import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {EDIT_MODE_EDIT} from "../../../constants/Common";
import {enableButtonsSelector} from "adm-ducks/app";
import * as contentActions from "../../../actions/content-actions";
import EpisodeResourceForm from "../../episode-content-form";

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

        this._selected = null
    }

    render() {

        return <div className="episode-content">
            <EpisodeContent createAction={::this._create}
                            editAction={::this._edit}
                            removeAction={::this._remove}
                            editMode={this.props.editMode}
                            selected={this._selected}
                            data={this.props.input.value}
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

    _select(id) {
        if (id !== this._selected) {
            this._selected = id;
            this.forceUpdate()
        }
    }

    _create() {
        this.props.contentActions.create()
        this.setState({showDialog: true})
    }

    _edit(id) {
        let _contentItem = this.props.input.value.find(item => item.id === +id);

        this.props.contentActions.edit(_contentItem);
        this.setState({showDialog: true})
    }

    _save(value) {
        if (this.props.contentEditMode === EDIT_MODE_EDIT) {
            this._update(value)
        } else {
            this._insert(value)
        }

        this.props.contentActions.clear();
        this.setState({showDialog: false})
    }

    _cancel() {
        this.setState({showDialog: false})
        this.props.contentActions.clear();
    }

    _insert(data) {
        let _array = [...this.props.input.value]

        _array.push({...data, id: data.Id});

        this.props.input.onChange(_array)

        this._select(data.Id)
    }

    _update(data) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.id === +data.id
            })

        if (_index >= 0) {
            _array[_index] = Object.assign({}, data);
        }

        this.props.input.onChange(_array)
    }

    _remove(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.id === +id
            })

        if (_index >= 0) {
            _array.splice(_index, 1)
        }

        this.props.input.onChange(_array)
    }
}


class EpisodeContent extends GridControl {

    _getId() {
        return 'episode-content';
    }

    _getColumns() {
        let _columns = [
            {id: 'FileId', header: 'FileId', width: 120, sort: 'int'},
            {id: 'Name', header: ['????????????????', {content:"textFilter"}], fillspace: true, width: 300, sort: 'text'},
            {id: 'StartTime', header: ['?????????? ????????????', {content:"textFilter"}], width: 90, sort: 'int'},
            {id: 'Duration', header:  ['????????????????????????', {content:"textFilter"}], width: 90, sort: 'int'},
            // {id: 'FileName', header: '????????', width: 300,},
            {
                id: 'CompType',
                header: ['??????', {content:"selectFilter"}],
                width: 150,
                editor: 'select',
                sort: 'text',
                options: [
                    {id: 'PIC', value: '??????????????????????'},
                    {id: 'VDO', value: '??????????'},
                    {id: 'TXT', value: '??????????'},
                    {id: 'TLN', value: '????????????????'},
                ]
            },
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        contentItem: state.content.object,
        contentEditMode: state.content.editMode,
        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        contentActions: bindActionCreators(contentActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TocGrid);
