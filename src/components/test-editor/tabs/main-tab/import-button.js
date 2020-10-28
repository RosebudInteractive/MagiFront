import React, {useState,} from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import PropTypes from "prop-types";
import {uploadTest, uploadTestWithConfirm} from "adm-ducks/single-test";

function ImportButton(props) {

    const [menuVisible, setMenuVisible] = useState(false)

    const {testId, packageUploadProcess, disabled} = props,
        _importButtonCaption = packageUploadProcess ? "Идет импорт теста" : "Импорт теста из Word XML",
        _inputStyle = {display: "none"}


    const _execImport = (e) => {
        e.preventDefault()
        $('#file-dialog').unbind("change");
        $('#file-dialog').val("");

        $('#file-dialog').bind("change", function () {
            _uploadPackage(this.files)
        });

        $("#file-dialog").trigger('click');
    }

    const _execImportWithConfirm = (e) => {
        e.preventDefault()
        $('#file-dialog').unbind("change");
        $('#file-dialog').val("");

        $('#file-dialog').bind("change", function () {
            props.uploadTestWithConfirm({testId: testId, deleteInstances: true, file: this.files[0]})
        });

        $("#file-dialog").trigger('click');
    }

    const _uploadPackage = (files) => {
        props.uploadTest({testId: testId, deleteInstances: false, file: files[0]})
    }

    const _toggleMenu = (e) => {
        if (e) e.preventDefault()

        const _newValue = !menuVisible

        if (_newValue) {
            $("body").bind("click", _onClick)
        }

        setMenuVisible(!menuVisible)
    }

    const _hideMenu = () => {
        setMenuVisible(false)
        $("body").unbind("click", _onClick)
    }

    const _onClick = (e) => {
        if (!e.target.closest('.drop-down__menu') && !e.target.closest('.js-arrow')) {
            _hideMenu()
        }
    }

    return <div className="import-test-button">
        <input style={_inputStyle} type="file" id="file-dialog" accept=".xml"/>
        <button className="adm__button bottom-controls__button" onClick={_execImport} disabled={disabled}>{_importButtonCaption}</button>
        <button className={"adm__button bottom-controls__button js-arrow drop-down__button" + (menuVisible ? " _opened" : "")} onClick={_toggleMenu} disabled={disabled}/>
        <div className={"drop-down__menu" + (menuVisible ? " _opened" : "")}>
            <div className="drop-down__item" onClick={_execImport}>Импорт теста</div>
            <div className="drop-down__item" onClick={_execImportWithConfirm}>Импорт с удалением всех результатов прохождения теста</div>
        </div>
    </div>
}

ImportButton.propTypes = {
    testId: PropTypes.number,
    disabled: PropTypes.bool,
}

function mapStateToProps(state) {
    return {
        packageUploadProcess: state.singleEpisode.packageUploadProcess,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({uploadTest, uploadTestWithConfirm}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportButton)
