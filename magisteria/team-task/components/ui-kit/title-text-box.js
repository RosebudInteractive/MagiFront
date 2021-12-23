import React, {useEffect, useRef} from "react"
import {TextField, withStyles} from "@material-ui/core"
import {getWidthOfText} from "../../tools/text-functions";

const CssTextField = withStyles({
    root: {
        minHeight: "48px",
        '& label': {
            "font-family": "Inter",
            "font-size": "13px",
            "font-style": "normal",
            "font-weight": "400",
            "line-height": "18px",
            "letter-spacing": "0.15px",
            "text-align": "left",
            "&.MuiFormLabel-root.Mui-focused": {
                color: "#C8684C"
            },
            "&.MuiFormLabel-filled": {
                opacity: 0,
            },
        },
        "& .MuiInputLabel-outlined": {
            "transform": "translate(16px, 14px) scale(1)",
            "&.MuiInputLabel-shrink": {
                "transform": "translate(16px, 0px) scale(0.75)",
            }
        },
        '& .MuiOutlinedInput-root': {
            height: 48,
            '& fieldset': {
                border: "none",
            },
            '& fieldset legend': {
                display: "none"
            },
            "& input": {
                borderRadius: "8px",
                padding: "0 16px",
                height: "100%",
                border: '1px dashed transparent',
                "-webkit-transition": "border, background 300ms ease-out",
                "-moz-transition": "border, background 300ms ease-out",
                "-o-transition": "border, background 300ms ease-out",
                "transition": "border, background 300ms ease-out",
                "font-family": "Inter",
                "font-style": "normal",
                "font-weight": "normal",
                "font-size": "13px",
                "line-height": "18px",
                "letter-spacing": "normal",
                "color": "#19191D",
            },
            '&:hover input:not(.Mui-disabled)': {
                backgroundColor: "transparent",
                borderColor: '#D2D2D6',
            },
            '&.Mui-focused input': {
                border: '1px dashed #D2D2D6',
            },
            '&.Mui-disabled input': {
                backgroundColor: "#F8F8F8",
                color: "#9696A0",
            },
        },
    },
})(TextField);

export default function TitleTextBox(props) {

    let _className = props.extClass ? "input-field " + props.extClass : "input-field"

    useEffect(() => {
        if (_inputRef && _inputRef.current) {

            if (props.input.value) {
                const _style = window.getComputedStyle(_inputRef.current),
                    _fontName = _style.getPropertyValue('font-family'),
                    _fontSize = _style.getPropertyValue('font-size')

                const _width = getWidthOfText(props.input.value, _fontName, _fontSize)

                _inputRef.current.style.width = Math.round(_width + 6) + 'px'
            } else {
                _inputRef.current.style.width = '125px'
            }

        }
    }, [props.input.value])

    const _inputRef = useRef(null)

    return <CssTextField {...props.input}
                         disabled={props.disabled || props.readOnly}
                         label={props.label}
                         variant="outlined"
                         multiline={false}
                         inputRef={_inputRef}
                         autoComplete="off"
                         className={_className}/>
}
