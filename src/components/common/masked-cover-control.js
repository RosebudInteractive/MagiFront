import React from 'react';
import PropTypes from 'prop-types';
import './controls.sass'
import Uploader from "./uploader";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {disableButtons, enableButtons} from "adm-ducks/app";
import {showErrorDialog} from "../../actions/app-actions";

class SelectControl extends React.Component {

    static propTypes = {
        mask: PropTypes.string,
    };

    constructor(props) {
        super(props)

        this._maskIndex = 0;

        this._masks = [];
        for (let i = 1; i <= 12; i++) {
            this._masks.push({id: '_mask' + i.toString().padStart(2, '0'), value: 'Маска ' + i})
        }
    }


    render() {
        const {input, meta: {error, visited}, id, label, disabled, hidden,} = this.props;

        let _mask = input.value ? input.value.mask : '',
            _cover = input.value ? '/data/' + input.value.cover : ''

        // const _style = {width: 360, height: 334}

        this._maskIndex = this._masks.findIndex((item) => {
            return item.id === _mask
        })

        let _image = '<image preserveAspectRatio="xMidYMid slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + _cover + '" x="0" width="574" height="503"/>';

        return <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
            <label htmlFor={id} className="field-label">{label}</label>
            <div className={"field-wrapper__editor-wrapper"}>
                <div className="cover-wrapper">
                    <div className={"cover " + _mask}>
                        <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                    </div>
                    <div className="cover-wrapper__controls">
                        <Uploader multiple={false} upload={'/api/adm/upload'}
                                  onUploadStart={::this.props.disableButtons}
                                  onUploadComplete={::this.props.enableButtons}
                                  onFileUploadError={::this._showError}
                                  onUploadFile={::this._handleFileUpload}/>
                        <button className="cover-control cover-control__btn up" onClick={::this._decMask}
                                disabled={this._maskIndex === 0}/>
                        <select className="cover-control field-input" onChange={::this._selectMask}>
                            {this._getMasks()}
                        </select>
                        <button className="cover-control cover-control__btn down" onClick={::this._incMask}
                                disabled={this._maskIndex === (this._masks.length - 1)}/>
                    </div>
                </div>
            </div>
        </div>
    }

    _decMask(e) {
        e.preventDefault()

        if (this._maskIndex > 0) {
            let _newMask = this._masks[this._maskIndex - 1]

            this.props.input.onChange({
                cover: this.props.input.value.cover,
                mask: _newMask.id
            })
        }
    }

    _incMask(e) {
        e.preventDefault()

        if (this._maskIndex < (this._masks.length - 1)) {
            let _newMask = this._masks[this._maskIndex + 1]

            this.props.input.onChange({
                cover: this.props.input.value.cover,
                mask: _newMask.id
            })
        }
    }

    _selectMask(e) {
        let _select = e.currentTarget,
            _selected = _select.options[_select.selectedIndex];

        this.props.input.onChange({
            cover: this.props.input.value.cover,
            mask: _selected.value
        })
    }

    _getMasks() {
        return this._masks.map((item) => {
            return <option value={item.id} selected={item.id === this.props.input.value.mask}>{item.value}</option>
        });
    }

    _showError() {
        this.props.showErrorDialog('При загрузке файла произошла ошибка')
    }

    _handleFileUpload(data) {
        let {value} = this.props.input

        if (data) {
            let _fileInfo = JSON.parse(data)

            this.props.input.onChange({
                cover: _fileInfo[0].file,
                mask: value.mask,
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

export default connect(null, mapDispatchToProps)(SelectControl);