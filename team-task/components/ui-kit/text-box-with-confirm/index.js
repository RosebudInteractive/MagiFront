import React, {useEffect, useMemo, useRef, useState} from "react"
import {TextField, withStyles} from "@material-ui/core"
import Pen from "tt-assets/svg/pen.svg"
import Apply from "tt-assets/svg/edit-apply.svg"
import Cancel from "tt-assets/svg/edit-cancel.svg"
import "./text-box.sass"

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
        "& .MuiOutlinedInput-multiline": {
            borderRadius: "8px",
            padding: "15px 16px",
            border: '1px solid #D2D2D6',
            "-webkit-transition": "border, background 300ms ease-out",
            "-moz-transition": "border, background 300ms ease-out",
            "-o-transition": "border, background 300ms ease-out",
            "transition": "border, background 300ms ease-out",
            "font-family": "Inter",
            "font-style": "normal",
            "font-weight": "normal",
            "font-size": "13px",
            "line-height": "18px",
            "letter-spacing": "0.15px",
            "color": "#19191D",
            '&:hover:not(.Mui-disabled)': {
                backgroundColor: "#E5E5E7",
                borderColor: '#C8684C',
            },
            '&.Mui-focused': {
                border: '1px solid #C8684C',
            },
            '&.Mui-disabled': {
                backgroundColor: "#F8F8F8",
                color: "#9696A0",
            },
        },

        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                border: "none",
            },
            '& fieldset legend': {
                display: "none"
            },
            "& input": {
                borderRadius: "8px",
                padding: "15px 16px",
                border: '1px solid #D2D2D6',
                "-webkit-transition": "border, background 300ms ease-out",
                "-moz-transition": "border, background 300ms ease-out",
                "-o-transition": "border, background 300ms ease-out",
                "transition": "border, background 300ms ease-out",
                "font-family": "Inter",
                "font-style": "normal",
                "font-weight": "normal",
                "font-size": "13px",
                "line-height": "18px",
                "letter-spacing": "0.15px",
                "color": "#19191D",

            },
            '&:hover input:not(.Mui-disabled)': {
                backgroundColor: "#E5E5E7",
                borderColor: '#C8684C',
            },
            '&.Mui-focused input': {
                border: '1px solid #C8684C',
            },
            '&.Mui-disabled input': {
                backgroundColor: "#F8F8F8",
                color: "#9696A0",
            },
        },
    },
})(TextField);

export default function TextBoxWithConfirm(props) {

    const [readOnly, setReadOnly] = useState(true)
    const [myValue, setMyValue] = useState("")

    useEffect(() => {
        setMyValue(props.input.value)
    }, [props.input])

    let _className = props.extClass ? "ui-kit__text-box-with_confirm " + props.extClass : "ui-kit__text-box-with_confirm"

    if (readOnly) {
        _className = _className + " _read-only"
    }

    const toggleReadOnly = () => {
        setReadOnly(false)
    }

    const apply = () => {
        props.input.onChange(myValue)
        setReadOnly(true)
    }

    const cancel = () => {
        setMyValue(props.input.value)
        setReadOnly(true)
    }

    const onChange = (e) => {
        setMyValue(e.currentTarget.value)
    }

    return <div className={_className}>
        <CssTextField disabled={props.disabled || readOnly}
                      label={props.label}
                      variant="outlined"
                      multiline={false}
                      value={myValue}
                      onChange={onChange}
                      className={"input-field _with-confirm"}/>
        {
            readOnly &&
            <div className="text-box-with_confirm__button _pen" onClick={toggleReadOnly}>
                <Pen/>
            </div>
        }
        {
            !readOnly &&
            <React.Fragment>
                <div className="text-box-with_confirm__button _apply" onClick={apply}>
                    <Apply/>
                </div>
                <div className="text-box-with_confirm__button _cancel" onClick={cancel}>
                    <Cancel/>
                </div>
            </React.Fragment>
        }
    </div>
}
