import React from 'react';
import PropTypes from 'prop-types';
import '../common/controls.sass'
import './image-link.sass'
import SnImageSelectForm from "./lesson-sn-image-form";
import ResourceForm from "../resource-form";
import {bindActionCreators} from "redux";
import * as resourcesActions from "../../actions/resources-actions";
import {connect} from "react-redux";
import * as singleLessonActions from "../../actions/lesson/lesson-actions";

export const IMAGE_TYPE = {
    OG : 'og',
    TWITTER : 'twitter',
}

class ImageLink extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        resources: PropTypes.array,
        imageType: PropTypes.string,
        disabled: PropTypes.bool,
    };

    constructor(props) {
        super(props)

        this.state = {
            showCreateDialog: false,
            showSelectDialog: false,
        }

        this._name = '';
        this._fileName = '';
    }

    componentWillMount() {
        let {fileName, name} = this._getResourceName(this.props.input.value)

        this._name = name
        this._fileName = fileName
    }

    componentDidUpdate(prevProps) {
        if (this.props.input.value !== prevProps.input.value) {
            let {fileName, name} = this._getResourceName(this.props.input.value)
            this._name = name
            this._fileName = fileName
            this.forceUpdate()
        }
    }

    _getResourceName(resourceId) {
        const _id = +resourceId

        if (!_id || !this.props.resources || !this.props.resources.length) {
            return ''
        }

        let _resource = this.props.resources.find((item) => {
            return item.Id === resourceId
        })

        return _resource ? {name : _resource.Name, fileName: _resource.FileName} : {name: "", fileName: ""}
    }

    render() {
        const {meta: {error, touched}, id, label, placeholder, disabled, hidden,} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        return <React.Fragment>
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    <div className={"image-link-wrapper"}>
                        <input className="field-input field-text" type='text' value={this._name} id={id} placeholder={placeholder}
                               disabled={disabled ? "disabled" : ""}/>
                        <button className="image-link-wrapper__button upload" onClick={::this._showCreateDialog} disabled={disabled}/>
                        <button className="image-link-wrapper__button find" onClick={::this._showSelectDialog} disabled={disabled}/>
                    </div>
                    {this._fileName && <img className="image-link__preview" src={'/data/' + this._fileName}/>}
                    {_errorText}
                </div>
            </div>
            {
                this.state.showSelectDialog ?
                    <SnImageSelectForm
                        cancel={::this._closeSelectDialog}
                        save={::this._selectImage}
                        resources={this.props.resources}
                    />
                    :
                    null
            }
            {
                this.state.showCreateDialog ?
                    <ResourceForm
                        cancel={::this._closeCreateDialog}
                        save={::this._saveResource}
                        data={this.props.resource}
                    />
                    :
                    null
            }

        </React.Fragment>
    }

    _showSelectDialog() {
        this.setState({showSelectDialog: true})
    }

    _closeSelectDialog() {
        this.setState({showSelectDialog: false})
    }

    _selectImage(value) {
        this._setValue(value.Id)

        this.setState({showSelectDialog: false})
    }

    _setValue(id) {
        const {onChange, input, resources} = this.props

        if (!(resources && Array.isArray(resources) && (resources.length > 0))) {
            return
        }

        if (onChange) onChange(id)
        if (input) input.onChange(id)
    }

    _showCreateDialog() {
        this.setState({showCreateDialog: true})
        this.props.resourcesActions.create({ShowInGalery: false})
    }

    _closeCreateDialog() {
        this.setState({ showCreateDialog: false })
        this.props.resourcesActions.clear();
    }

    _saveResource(value) {
        this.props.resources.push({...value, id: value.Id})

        if (this.props.imageType === IMAGE_TYPE.OG) {
            this.props.lessonActions.setOgImage(value.Id);
        }

        if (this.props.imageType === IMAGE_TYPE.TWITTER) {
            this.props.lessonActions.setTwitterImage(value.Id);
        }

        this._setValue(value.Id)

        this.props.resourcesActions.clear();
        this.setState({ showCreateDialog: false })
    }
}

function mapStateToProps(state) {
    return {
        // resources: state.lessonResources.current,
        // selected: state.lessonResources.selected,
        // resourceEditMode: state.resources.editMode,
        resource: state.resources.object,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        // lessonResourcesActions: bindActionCreators(lessonResourcesActions, dispatch),
        resourcesActions: bindActionCreators(resourcesActions, dispatch),
        lessonActions: bindActionCreators(singleLessonActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImageLink);