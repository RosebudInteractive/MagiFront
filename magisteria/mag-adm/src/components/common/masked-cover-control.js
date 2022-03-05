import React from 'react';
import './controls.sass'
import Uploader from "./uploader";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {disableButtons, enableButtons} from "adm-ducks/app";
import {showErrorDialog} from "../../actions/app-actions";

const MASKS = [
    {id: '_mask01', value: 'Маска 1', width: 574, height: 503,},
    {id: '_mask02', value: 'Маска 2', width: 543, height: 511,},
    {id: '_mask03', value: 'Маска 3', width: 549, height: 549,},
    {id: '_mask04', value: 'Маска 4', width: 546, height: 492,},
    {id: '_mask05', value: 'Маска 5', width: 564, height: 515,},
    {id: '_mask06', value: 'Маска 6', width: 566, height: 507,},
    {id: '_mask07', value: 'Маска 7', width: 570, height: 569,},
    {id: '_mask08', value: 'Маска 8', width: 528, height: 551,},
    {id: '_mask09', value: 'Маска 9', width: 560, height: 529,},
    {id: '_mask10', value: 'Маска 10', width: 560, height: 479,},
    {id: '_mask11', value: 'Маска 11', width: 525, height: 495,},
    {id: '_mask12', value: 'Маска 12', width: 548, height: 507,},
]

class MaskedCoverControl extends React.Component {

    constructor(props) {
        super(props)

        this._maskIndex = 0;
    }


    render() {
        const {input, meta: {error, visited}, id, label, disabled, hidden,} = this.props;

        let _mask = input.value ? input.value.mask : '',
            _cover = (input.value && input.value.file) ? '/data/' + input.value.file : ''

        this._maskIndex = MASKS.findIndex((item) => {
            return item.id === _mask
        })

        let _svgData = this._getMaskedImage(_cover)

        return <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
            <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
            <div className={"field-wrapper__editor-wrapper"}>
                <div className="cover-wrapper">
                    <div className={"cover _unfadable " + _mask}>
                        {
                            _svgData ?
                                <svg viewBox={"0 0 " + _svgData.width + " " + _svgData.height} width={_svgData.width} height={_svgData.height}
                                     dangerouslySetInnerHTML={{__html: _svgData.image}}/>
                                :
                                null
                        }
                    </div>
                    <div className="cover-wrapper__controls">
                        <Uploader multiple={false} upload={'/api/adm/upload'}
                                  onUploadStart={::this.props.disableButtons}
                                  onUploadComplete={::this.props.enableButtons}
                                  onFileUploadError={::this._showError}
                                  onUploadFile={::this._handleFileUpload}
                                  disabled={disabled}/>
                        <button className="cover-control cover-control__btn up" onClick={::this._decMask}
                                disabled={(this._maskIndex === 0) || disabled}/>
                        <select className="cover-control field-input" onChange={::this._selectMask} disabled={disabled}>
                            {this._getMasks()}
                        </select>
                        <button className="cover-control cover-control__btn down" onClick={::this._incMask}
                                disabled={(this._maskIndex === (MASKS.length - 1)) || disabled}/>
                    </div>
                </div>
            </div>
        </div>
    }

    _getMaskedImage(cover) {
        let _mask = MASKS[this._maskIndex]

        if (_mask && cover) {
            let _image = '<image preserveAspectRatio="xMidYMid slice" ' +
                'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
                'xlink:href="' + cover + '" x="0" ' +
                'width="' + _mask.width + '" height="' + _mask.height + '"/>'

            return {
                image: _image,
                width: _mask.width,
                height: _mask.height,
            }
        } else {
            return null
        }

    }

    _decMask(e) {
        e.preventDefault()

        if (this._maskIndex > 0) {
            let _newMask = MASKS[this._maskIndex - 1]

            this.props.input.onChange({
                file: this.props.input.value.file,
                mask: _newMask.id,
                meta: this.props.input.value.meta,
            })
        }
    }

    _incMask(e) {
        e.preventDefault()

        if (this._maskIndex < (MASKS.length - 1)) {
            let _newMask = MASKS[this._maskIndex + 1]

            this.props.input.onChange({
                file: this.props.input.value.file,
                mask: _newMask.id,
                meta: this.props.input.value.meta,
            })
        }
    }

    _selectMask(e) {
        let _select = e.currentTarget,
            _selected = _select.options[_select.selectedIndex];

        this.props.input.onChange({
            file: this.props.input.value.file,
            mask: _selected.value,
            meta: this.props.input.value.meta,
        })
    }

    _getMasks() {
        return MASKS.map((item) => {
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
                file: _fileInfo[0].file,
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

export default connect(null, mapDispatchToProps)(MaskedCoverControl);