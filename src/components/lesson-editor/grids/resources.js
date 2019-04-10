import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as lessonResourcesActions from '../../../actions/lesson/lesson-resources-actions';
import * as resourcesActions from '../../../actions/resources-actions';
import ResourceForm from "../../resource-form";
import {EDIT_MODE_EDIT} from "../../../constants/Common";
import MultiResourceForm from "../../multi-resource-form";
import {enableButtonsSelector} from "adm-ducks/app";

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
    }

    render() {

        return <div className="lesson-resources">
            <LessonResources selectAction={::this.props.lessonResourcesActions.select}
                             createAction={::this._create}
                             editAction={::this._edit}
                             removeAction={::this.props.lessonResourcesActions.remove}
                             multiUploadAction={::this._multiUpload}
                             editMode={this.props.editMode}
                             selected={this.props.selected}
                             data={this.props.resources}
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

    _create() {
        this.props.resourcesActions.create({ShowInGalery: false})
        this.setState({ showResourceDialog: true })
    }

    _edit(id) {
        let _resource = this.props.resources.find((item) => {
            return item.id === +id
        });

        this.props.resourcesActions.edit(_resource);
        this.setState({ showResourceDialog: true })
    }

    _save(value) {
        if (this.props.resourceEditMode === EDIT_MODE_EDIT) {
            this.props.lessonResourcesActions.update(value)
        } else {
            this.props.lessonResourcesActions.insert(value);
        }

        this.props.resourcesActions.clear();
        this.setState({ showResourceDialog: false })
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
        this.props.lessonResourcesActions.multipleInsert(resources);
        this.props.resourcesActions.finishUpload();
        this.setState({ showMultipleUploadDialog: false })
    }

    _cancelUpload() {
        this.props.resourcesActions.cancelUpload();
        this.setState({ showMultipleUploadDialog: false })
    }
}


export class LessonResources extends GridControl {

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

function mapStateToProps(state) {
    return {
        resources: state.lessonResources.current,
        selected: state.lessonResources.selected,
        resourceEditMode: state.resources.editMode,
        resource: state.resources.object,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonResourcesActions: bindActionCreators(lessonResourcesActions, dispatch),
        resourcesActions: bindActionCreators(resourcesActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourcesGrid);