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
        disabled: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._uploader = null;
    }

    render() {
        return <form method="#" encType="multipart/form-data">
            <input ref={e => this._uploader = e} multiple type="file" accept="image/*" hidden
                   onChange={::this._uploadFiles}/>
            <button className="cover-control cover-control__btn upload" onClick={::this._upload} disabled={this.props.disabled}/>
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

            // let ajax = new XMLHttpRequest();
            // ajax.upload.addEventListener("progress", progressHandler, false);
            // ajax.addEventListener("load", (e) => {
            //     console.log(e)
            //     _count--
            //     _checkFinished()
            // }, false);
            // ajax.addEventListener("error", errorHandler, false);
            // ajax.addEventListener("abort", abortHandler, false);
            // ajax.open("POST", "file_upload_parser.php"); // http://www.developphp.com/video/JavaScript/File-Upload-Progress-Bar-Meter-Tutorial-Ajax-PHP
            // //use file_upload_parser.php from above url
            // ajax.send(formdata);

            fetch(this.props.upload, {
                method: 'POST',
                body: formData,
            })
                .then(this._readResponse)
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

    _readResponse(response) {
        let _reader = response.body.getReader();
        let _data = '',
            _bytesReceived = 0;

        return _reader.read().then(function processText({done, value}) {
            if (done) {
                return _data;
            }

            _bytesReceived += value.length;
            console.log(_bytesReceived)

            const chunk = new TextDecoder("utf-8").decode(value);
            _data += chunk;
            // Read some more, and call this function again
            return _reader.read().then(processText);
        })
    }
}

