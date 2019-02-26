import React from 'react';
import PropTypes from 'prop-types';
import './controls.sass'
import {readResponseBody} from "../../tools/fetch-tools";

export default class Uploader extends React.Component {

    static propTypes = {
        upload: PropTypes.string,
        multiple: PropTypes.bool,
        onUploadStart: PropTypes.func,
        onUploadComplete: PropTypes.func,
        onUploadFile: PropTypes.func,
        onFileUploadError: PropTypes.func,
    }

    constructor(props) {
        super(props)

        this._uploader = null;
    }

    render() {
        return <form method="#" encType="multipart/form-data">
            <input ref={e => this._uploader = e} multiple type="file" accept="image/*" hidden
                   onChange={::this._uploadFiles}/>
            <button className="cover-control cover-control__btn upload" onClick={::this._upload}/>
        </form>
    }


    _upload(e) {
        e.preventDefault()

        if (this._uploader) {
            this._uploader.click()
        }
    }

    _uploadFiles() {
        let _files = this._uploader.files,
            _count = _files.length


        if ((_count > 0) && this.props.onUploadStart) {
            this.props.onUploadStart()
        }

        let _checkFinished = () => {
            if ((_count <= 0) && this.props.onUploadComplete) {
                this.props.onUploadComplete()
            }
        }

        for (let i = 0; i < _files.length; i++) {
            let formData = new FormData();
            formData.append('file', _files[i]);

            fetch(this.props.upload, {
                method: 'POST',
                body: formData,
            })
                .then(readResponseBody)
                .then((data) => {
                    if (this.props.onUploadFile) {
                        this.props.onUploadFile(data)
                    }
                    _count--
                    _checkFinished()

                })
                .catch(error => {
                    if (this.props.onFileUploadError) {
                        this.props.onFileUploadError(error)
                    }
                    _count--
                    _checkFinished()
                })
        }
    }
}