import React from 'react';
import PropTypes from 'prop-types';
import './controls.sass'

export default class Uploader extends React.Component {

    static propTypes = {
        upload: PropTypes.string,
        multiple: PropTypes.bool,
        onUploadStart: PropTypes.func,
        onUploadComplete: PropTypes.func,
        onUploadFile: PropTypes.func,
        onFileUploadError: PropTypes.func,
        onProgress: PropTypes.func,
        disabled: PropTypes.bool,
        acceptType: PropTypes.string,
    }

    constructor(props) {
        super(props)

        this._uploader = null;
    }

    render() {
        return <form method="#" encType="multipart/form-data">
            <input ref={e => this._uploader = e} multiple type="file" accept={this.props.acceptType ? this.props.acceptType : "image/*"} hidden
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

            let xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    let _percentComplete = Math.round(100 *(event.loaded / event.total));
                    if (this.props.onProgress) {
                        this.props.onProgress({file: _files[i], percent: _percentComplete})
                    }
                }
            };

            xhr.onload = xhr.onerror = (event) => {
                if (event.target.status === 200) {
                    if (this.props.onUploadFile) {
                        this.props.onUploadFile(event.target.response)
                    }
                } else {
                    if (this.props.onFileUploadError) {
                        this.props.onFileUploadError(event.target.responseText)
                    }
                }

                _count--
                _checkFinished()
            }

            xhr.addEventListener("abort", (e) => {
                console.log(e)
            }, false);
            xhr.open("POST", this.props.upload);
            xhr.send(formData);
        }
    }
}

