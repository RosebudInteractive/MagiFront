import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import PropTypes from "prop-types";
import {uploadTest} from "adm-ducks/single-test";

class ImportButton extends React.Component {
    static propTypes = {
        testId: PropTypes.number,
        disabled: PropTypes.bool,
    }

    render() {
        const {packageUploadProcess} = this.props,
            _importButtonCaption = packageUploadProcess ? "Идет импорт теста" : "Импорт теста из Word XML",
            _inputStyle = {display: "none"}

        return <React.Fragment>
            <input style={_inputStyle} type="file" id="file-dialog" accept=".xml"/>
            <button className="adm__button bottom-controls__button"
                    onClick={::this._execImport} disabled={this.props.disabled}>{_importButtonCaption}</button>
        </React.Fragment>

    }

    _execImport(e) {
        e.preventDefault()
        $('#file-dialog').unbind("change");
        $('#file-dialog').val("");

        let that = this;
        $('#file-dialog').bind("change", function () {
            that._uploadPackage(this.files)
        });

        $("#file-dialog").trigger('click');
    }

    _uploadPackage(files) {
        this.props.uploadTest({testId: this.props.testId, file: files[0]})
    }
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
