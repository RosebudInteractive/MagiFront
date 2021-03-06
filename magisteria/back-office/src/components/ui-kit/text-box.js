import React from "react"
import {TextField, withStyles} from "@material-ui/core"

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
                // "color": "#19191D"
            },
        },
        // '& label[data-shrink="true"]': {
        //     // display: "none"
        // },
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
            "&.Mui-focused": {
                border: '1px solid #C8684C',
                // color: "#C8684C"
                "color": "#19191D"
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
                // color: "#C8684C"
                "color": "#19191D"
            },
            '&.Mui-disabled input': {
                backgroundColor: "#F8F8F8",
                color: "#9696A0",
            },
            '& p.MuiFormHelperText-contained.Mui-error.MuiFormHelperText-filled':{
                backgroundColor: 'green',
                position: 'fixed !important',
                top: '45px !important'
            }
        },
        '& p': {
            position: 'absolute',
            top: '45px'
        }
    },
})(TextField);

export default React.forwardRef(function UiTextBox(props, ref) {

    const className = props.extClass ?  "input-field " + props.extClass : "input-field";

    const allProps = {...props, ...props.input}

    return <CssTextField {...allProps}
                         error={props.meta && props.meta.touched && props.meta.invalid}
                         disabled={props.disabled}
                         label={props.label}
                         variant="outlined"
                         autoComplete="off"
                         className={className}
                         ref={ref}
                         helperText={props.meta && props.meta.touched && props.meta.error}/>
})
