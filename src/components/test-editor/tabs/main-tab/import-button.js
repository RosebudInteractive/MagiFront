import React, {useState, useEffect} from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import PropTypes from "prop-types";
import {uploadTest} from "adm-ducks/single-test";

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

    const _execImportWithConfirm = () => {

    }

    const _uploadPackage = (files) => {
        props.uploadTest({testId: testId, file: files[0]})
    }

    const _toggleMenu = () => {
        setMenuVisible(!menuVisible)
    }

    return <div className="import-test-button">
        <input style={_inputStyle} type="file" id="file-dialog" accept=".xml"/>
        <button className="adm__button bottom-controls__button" onClick={_execImport} disabled={disabled}>{_importButtonCaption}</button>
        <button className={"adm__button bottom-controls__button drop-down__button" + (menuVisible ? " _opened" : "")}onClick={_toggleMenu} disabled={disabled}/>
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
    return bindActionCreators({uploadTest}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportButton)
