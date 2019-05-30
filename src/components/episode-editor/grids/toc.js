import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import EpisodeTocForm from "../../episode-toc-form";
import {EDIT_MODE_EDIT} from "../../../constants/Common";
import {enableButtonsSelector} from "adm-ducks/app";
import * as episodeTocActions from "../../../actions/episode/episode-tocs-actions";
import * as tocActions from "../../../actions/toc-actions";

class TocGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            showDialog: false,
        }
    }

    render() {

        return <div className="episode-toc">
            <EpisodeToc selectAction={::this.props.episodeTocActions.select}
                        createAction={::this._create}
                        editAction={::this._edit}
                        removeAction={::this.props.episodeTocActions.remove}
                        moveUpAction={::this.props.episodeTocActions.moveUp}
                        moveDownAction={::this.props.episodeTocActions.moveDown}
                        editMode={this.props.editMode}
                        selected={this.props.selected}
                        data={this.props.episodeToc}
                        disabled={!this.props.enableButtons}/>
            {
                this.state.showDialog ?
                    <EpisodeTocForm
                        cancel={::this._cancel}
                        save={::this._save}
                        data={this.props.toc}
                    />
                    :
                    null
            }
        </div>

    }

    _create() {
        this.props.tocActions.create()
        this.setState({showDialog: true})
    }

    _edit(id) {
        let _toc = this.props.episodeToc.find((item) => {
            return item.id === parseInt(id)
        });

        this.props.tocActions.edit(_toc);
        this.setState({showDialog: true})
    }

    _save(value) {
        if (this.props.tocEditMode === EDIT_MODE_EDIT) {
            this.props.episodeTocActions.update(value)
        } else {
            this.props.episodeTocActions.insert(value);
        }

        this.setState({showDialog: false})
        this.props.tocActions.clear();
    }

    _cancel() {
        this.setState({showDialog: false})
        this.props.tocActions.clear();
    }
}


class EpisodeToc extends GridControl {

    _getId() {
        return 'episode-toc';
    }

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

function mapStateToProps(state) {
    return {
        toc: state.toc.object,
        episodeToc: state.episodeToc.current,
        selected: state.episodeToc.selected,
        tocEditMode: state.toc.editMode,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        tocActions: bindActionCreators(tocActions, dispatch),
        episodeTocActions: bindActionCreators(episodeTocActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TocGrid);