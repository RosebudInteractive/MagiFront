import React, {useCallback, useMemo, useRef} from "react"
import {TextBox} from "../../ui-kit";
import Uploader from "../../../tools/uploader/uploader";

type Props = {}

export default function CoverUploader(props: Props) {
    const {input} = props

    const _textBox = useRef(null)

    const _value = useMemo(() => {
        return (input.value && input.value.file) ? input.value.file : ''
    }, [input.value])

    const _handleProgress = useCallback(({percent}) => {
        if (!_textBox.current || !_textBox.current.children[1]) return

        const _control = _textBox.current.children[1]

        if (percent < 100) {
            _control.style.background = `linear-gradient(to left, #f1f7ff ${100 - percent}%, #75b5ff 0%)`
        } else {
            _control.style.background = 'none'
        }
    }, [])

    const _onUploadFile = useCallback((data) => {
        if (data) {
            let _fileInfo = JSON.parse(data)

            input.onChange({
                file: _fileInfo[0].file,
                meta: _fileInfo[0].info
            })
        }
    }, [input])

    return <div className="timeline-form__field-file-name">
        <TextBox label={"Фоновое изображение"}
                 placeholder={"Фоновое изображение"}
                 readonly={true}
                 value={_value}
                 meta={{...props.meta}}
                 ref={_textBox}/>
        <Uploader upload={'/api/pm/upload'}
                  multiple={false}
                  buttonText={'Выбрать файл'}
                  onProgress={_handleProgress}
                  acceptType={"image/*"}
                  onUploadFile={_onUploadFile}/>
    </div>
}
