import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {uploadPackage} from "../../../../actions/episode/episode-actions";

class ImportButton extends React.Component {

    render() {
        const {packageUploadProcess} = this.props,
            _importButtonCaption = packageUploadProcess ? "Идет импорт эпизода" : "Импорт эпизода из Word XML"

        return <button className="adm__button bottom-controls__button" onClick={::this._execImport}>{_importButtonCaption}</button>
    }

    _execImport(e) {
        e.preventDefault()

    }
}

function mapStateToProps(state) {
    return {
        packageUploadProcess: state.singleEpisode.packageUploadProcess,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({uploadPackage}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportButton)
