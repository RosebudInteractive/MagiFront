import React from 'react';
import PropTypes from 'prop-types';
import '../../../common/controls.sass'
import './audion-link.sass'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import Uploader from "../../../common/uploader";
import {showErrorDialog} from "../../../../actions/app-actions";
import {disableButtons, enableButtons} from "adm-ducks/app";

class AudioLink extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        disabled: PropTypes.bool,
    };

    static defaultProps = {
        id : 'file-name'
    }

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this._metaObj = this.props.input.value.meta
    }

    componentWillReceiveProps(nextProps) {
        if (!Object.is(this.props.input.value, nextProps.input.value)) {
            this._metaObj = nextProps.input.value.meta
        }
    }

    render() {
        const {input, meta: {error, touched}, id, label, placeholder, disabled, hidden,} = this.props,
            _name = (input.value && input.value.file) ? input.value.file : ''

        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        return <React.Fragment>
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    <div className={"image-link-wrapper"}>
                        <input className="field-input field-text" type='text' value={_name} id={id} placeholder={placeholder}
                               disabled={disabled ? "disabled" : ""}/>
                        <Uploader multiple={false} upload={'/api/adm/upload'}
                                  onUploadStart={::this.props.disableButtons}
                                  onUploadComplete={::this.props.enableButtons}
                                  onFileUploadError={::this._showError}
                                  onUploadFile={::this._handleFileUpload}
                                  onProgress={::this._handleProgress}
                                  acceptType={"audio/*"}
                                  disabled={disabled}/>
                    </div>
                    {_errorText}
                </div>
            </div>
        </React.Fragment>
    }

    _showError() {
        this.props.showErrorDialog('При загрузке файла произошла ошибка')
    }

    _handleFileUpload(data) {
        if (data) {
            let _fileInfo = JSON.parse(data)

            this.props.input.onChange({
                file: _fileInfo[0].file,
                meta: _fileInfo[0].info
            })
        }
    }

    _handleProgress({percent}) {
        if (percent < 100) {
            $('#' + this.props.id).css('background', `linear-gradient(to left, #f1f7ff ${100 - percent}%, #75b5ff 0%)`)
        } else {
            $('#' + this.props.id).css('background', 'none')
        }
    }
}

function mapStateToProps(state) {
    return {
        // resources: state.lessonResources.current,
        // selected: state.lessonResources.selected,
        // resourceEditMode: state.resources.editMode,
        // resource: state.resources.object,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showErrorDialog: bindActionCreators(showErrorDialog, dispatch),
        disableButtons: bindActionCreators(disableButtons, dispatch),
        enableButtons: bindActionCreators(enableButtons, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AudioLink);