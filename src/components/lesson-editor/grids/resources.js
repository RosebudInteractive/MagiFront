import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {change as changeValue} from 'redux-form'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as resourcesActions from '../../../actions/resources-actions';
import ResourceForm from "../../resource-form";
import {EDIT_MODE_EDIT} from "../../../constants/Common";
import MultiResourceForm from "../../multi-resource-form";
import {enableButtonsSelector} from "adm-ducks/app";
import {formValueSelector} from "redux-form";

class ResourcesGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            showResourceDialog: false,
            showMultipleUploadDialog: false,
        }

        this._selected = null;
    }

    render() {

        return <div className="lesson-resources">
            <LessonResources selectAction={::this._select}
                             createAction={::this._create}
                             editAction={::this._edit}
                             removeAction={::this._remove}
                             multiUploadAction={::this._multiUpload}
                             editMode={this.props.editMode}
                             selected={this._selected}
                             data={this.props.input.value}
                             disabled={!this.props.enableButtons}/>
            {
                this.state.showResourceDialog ?
                    <ResourceForm
                        cancel={::this._cancel}
                        save={::this._save}
                        data={this.props.resource}
                    />
                    :
                    null
            }
            {
                this.state.showMultipleUploadDialog ?
                    <MultiResourceForm
                        cancel={::this._cancelUpload}
                        finish={::this._finishUpload}
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
        this.props.resourcesActions.create({ShowInGalery: false})
        this.setState({ showResourceDialog: true })
    }

    _remove(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.id === +id
            })

        if (_index >= 0) {
            _array.splice(_index, 1)

            this.props.input.onChange(_array)

            if (id === this.props.ogImageResourceId) {
                this.props.changeValue('LessonEditor', 'ogImageResourceId', null)
            }

            if (id === this.props.twitterImageResourceId) {
                this.props.changeValue('LessonEditor', 'twitterImageResourceId', null)
            }
        }
    }

    _edit(id) {
        let _resource = this.props.input.value.find((item) => {
            return item.id === +id
        });

        this.props.resourcesActions.edit(_resource);
        this.setState({ showResourceDialog: true })
    }

    _save(value) {
        if (this.props.resourceEditMode === EDIT_MODE_EDIT) {
            this._update(value)
        } else {
            this._insert(value);
        }

        this.props.resourcesActions.clear();
        this.setState({ showResourceDialog: false })
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

    _cancel() {
        this.setState({ showResourceDialog: false })
        this.props.resourcesActions.clear();
    }

    _multiUpload() {
        this.setState({ showMultipleUploadDialog: true })
        this.props.resourcesActions.multiUpload()
    }

    _finishUpload(resources) {
        this._multipleInsert(resources);
        this.props.resourcesActions.finishUpload();
        this.setState({ showMultipleUploadDialog: false })
    }

    _multipleInsert(resources) {
        let _array = [...this.props.input.value]
        this.props.input.onChange(_array.concat(resources))
    }

    _cancelUpload() {
        this.props.resourcesActions.cancelUpload();
        this.setState({ showMultipleUploadDialog: false })
    }
}


class LessonResources extends GridControl {

    _getId() {
        return 'lesson-resources';
    }

    _getColumns() {
        let _columns = [
            {id: 'FileId', header: 'FileId', width: 60,},
            {id: 'Name', header: 'Название', width: 300,},
            {id: 'Description', header: 'Описание', fillspace: true,},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

const selector = formValueSelector('LessonEditor')

const _ResourcesGrid = connect(state => {
    return {
        ogImageResourceId: selector(state, 'ogImageResourceId'),
        twitterImageResourceId: selector(state, 'twitterImageResourceId'),
    }
})(ResourcesGrid)

function mapStateToProps(state) {
    return {
        resourceEditMode: state.resources.editMode,
        resource: state.resources.object,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        resourcesActions: bindActionCreators(resourcesActions, dispatch),
        changeValue: bindActionCreators(changeValue, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(_ResourcesGrid);