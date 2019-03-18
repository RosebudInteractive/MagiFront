import React from 'react';
import PropTypes from 'prop-types';
import './controls.sass'
import SnImageSelectForm from "./lesson-sn-image-form";
import ResourceForm from "../resource-form";

export default class ImageLink extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        resources: PropTypes.array,
    };

    constructor(props) {
        super(props)

        this.state = {
            showCreateDialog: false,
            showSelectDialog: false,
        }
    }

    render() {
        const {input, meta: {error, touched}, id, label, placeholder, disabled, hidden,} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        return <React.Fragment>
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    <div className={"image-link-wrapper"}>
                        <input className="field-input" type='text' value={input.name} id={id} placeholder={placeholder}
                               disabled={disabled ? "disabled" : ""}/>
                        <button className="image-link-wrapper__upload-button" onClick={::this._showCreateDialog}/>
                        <button className="image-link-wrapper__select-button" onClick={::this._showSelectDialog}/>
                    </div>

                    {_errorText}
                </div>
            </div>
            {
                this.state.showSelectDialog ?
                    <SnImageSelectForm
                        cancel={::this._closeSelectDialog}
                        save={::this._setValue}
                        lessonId={this.props.lessonId}
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

    _setValue(id) {
        const {onChange, input, resources} = this.props

        if (!(resources && Array.isArray(resources) && (resources.length > 0))) {
            return
        }

        let _resource = resources.find((item) => {
            return item.Id === this.props.id
        })

        let _value = {id: id, name: _resource.Name}

        if (onChange) onChange(_value)
        if (input) input.onChange(_value)
    }

    _showCreateDialog() {
        this.setState({showCreateDialog: true})
        this.props.resourcesActions.create({ShowInGalery: false})
    }
}