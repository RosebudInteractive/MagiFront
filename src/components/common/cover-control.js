import React from 'react';
import './controls.sass'
import Uploader from "./uploader";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {disableButtons, enableButtons} from "adm-ducks/app";
import {showErrorDialog} from "../../actions/app-actions";

const WIDTH = 360

class CoverControl extends React.Component {

    constructor(props) {
        super(props)

        this._metaObj = null
        this.state = {
            imageLoaded: false
        }
    }

    componentWillMount() {
        this._metaObj = this.props.input.value.meta ? JSON.parse(this.props.input.value.meta) : null
    }

    componentWillReceiveProps(nextProps) {
        if (!Object.is(this.props.input.value, nextProps.input.value)) {
            this.setState({
                imageLoaded: false
            })

            this._metaObj = nextProps.input.value.meta ? JSON.parse(nextProps.input.value.meta) : null
        }
    }

    render() {
        const {input, id, label, hidden, disabled} = this.props;

        let _cover = (input.value && input.value.file) ? '/data/' + input.value.file : '',
            _coverSize = this._getSize(),
            _imageStyle = _coverSize ? {width: _coverSize.width, height: _coverSize.height} : null

        return <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
            <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
            <div className={"field-wrapper__editor-wrapper"}>
                <div className="cover-wrapper">
                    {
                        _cover ?
                            <img className={"cover" + (this.state.imageLoaded ? " _visible" : "")} style={_imageStyle} src={_cover} alt={_cover} onLoad={::this._imageLoadHandler}/>
                            :
                            <div className="cover" style={_imageStyle}/>
                    }
                    <div className="cover-wrapper__controls">
                        <Uploader multiple={false} upload={'/api/adm/upload'}
                                  onUploadStart={::this.props.disableButtons}
                                  onUploadComplete={::this.props.enableButtons}
                                  onFileUploadError={::this._showError}
                                  onUploadFile={::this._handleFileUpload}
                                  disabled={disabled}/>
                    </div>
                </div>
            </div>
        </div>
    }

    _imageLoadHandler() {
        this.setState({
            imageLoaded: true
        })
    }

    _getSize() {
        if (this._metaObj) {
            let _ratio = this._metaObj.size.height / this._metaObj.size.width
            return {width: WIDTH, height: WIDTH * _ratio}
        } else {
            return {width: WIDTH, height: 33}
        }
    }

    _showError() {
        this.props.showErrorDialog('При загрузке файла произошла ошибка')
    }

    _handleFileUpload(data) {
        if (data) {
            let _fileInfo = JSON.parse(data)

            this.props.input.onChange({
                file: _fileInfo[0].file,
                meta: JSON.stringify(_fileInfo[0].info)
            })
        }

    }
}

function mapDispatchToProps(dispatch) {
    return {
        disableButtons: bindActionCreators(disableButtons, dispatch),
        enableButtons: bindActionCreators(enableButtons, dispatch),
        showErrorDialog: bindActionCreators(showErrorDialog, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(CoverControl);