import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {change as changeValue, formValueSelector} from 'redux-form'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as resourcesActions from '../../../actions/resources-actions';
import ResourceForm from "../../resource-form";
import MultiResourceForm from "../../multi-resource-form";
import {enableButtonsSelector} from "adm-ducks/app";

const NEW_RESOURCE = {
    Id: null,
    ShowInGalery: false,
}

class ResourcesGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            showResourceDialog: false,
            showMultipleUploadDialog: false,
            scrollableResources: false,
        }

        this._selected = null
        this._resource = null
        this._internalId = -1
        this._resourceEditMode = false
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
                        data={this._resource}
                        scrollable={this.state.scrollableResources}
                        onPrevClick={ !this._isFirstEdit() ? ::this._editPrev : null }
                        onNextClick={ !this._isLastEdit() ? ::this._editNext : null }
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
        this._resource = Object.assign({}, NEW_RESOURCE)
        this._resource.Id = this._internalId
        this._resource.id = this._resource.Id
        this._internalId--;
        this._resourceEditMode = false

        this.setState({
            showResourceDialog: true,
            scrollableResources: false
        })
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
        const _currentIndex = this.props.input.value.findIndex((item) => {
            return item.id === +id
        })

        if (_currentIndex >= 0) {
            let _resource = this.props.input.value[_currentIndex];

            this._resource = Object.assign({}, _resource);
            this._resourceEditMode = true
            this.setState({
                showResourceDialog: true,
                scrollableResources: true,
                currentIndex: _currentIndex,
            })
        }
    }

    _editPrev() {
        const _newId = this.props.input.value[this.state.currentIndex - 1].id

        this._select(_newId)
        this._edit(_newId)
    }

    _editNext() {
        const _newId = this.props.input.value[this.state.currentIndex + 1].id

        this._select(_newId)
        this._edit(_newId)
    }

    _isFirstEdit() {
        return this.state.currentIndex === 0
    }

    _isLastEdit() {
        return this.state.currentIndex === this.props.input.value.length - 1
    }

    _save(value) {
        if (this._resourceEditMode) {
            this._update(value)
        } else {
            this._insert(value);
        }

        this.props.resourcesActions.clear();
        this.setState({showResourceDialog: false})
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
        this.setState({showResourceDialog: false})
        this.props.resourcesActions.clear();
    }

    _multiUpload() {
        this.setState({showMultipleUploadDialog: true})
        this.props.resourcesActions.multiUpload()
    }

    _finishUpload(resources) {
        this._multipleInsert(resources);
        this.props.resourcesActions.finishUpload();
        this.setState({showMultipleUploadDialog: false})
    }

    _multipleInsert(resources) {
        if (resources) {
            resources.forEach(item => {
                if (!item.Id) {
                    item.ShowInGalery = true
                    item.Id = this._internalId--
                    item.id = item.Id
                }
            })
        }

        let _array = [...this.props.input.value]
        this.props.input.onChange(_array.concat(resources))
    }

    _cancelUpload() {
        this.props.resourcesActions.cancelUpload();
        this.setState({showMultipleUploadDialog: false})
    }
}


class LessonResources extends GridControl {

    _getId() {
        return 'lesson-resources';
    }

    _getColumns() {
        let _columns = [
            {id: 'FileId', header: 'FileId', width: 60,},
            {id: 'Name', header: ['????????????????', {content:"textFilter"}], width: 300,},
            {id: 'Description', header: ['????????????????', {content:"textFilter"}], fillspace: true,},
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
