import React, {useRef} from "react"
import {withStyles} from "@material-ui/core"
import {KeyboardDatePicker} from "@material-ui/pickers"

const CssKeyboardDatePicker = withStyles({
    root: {
        minHeight: "48px",
        '& label': {
            left: 16,
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
        },
        '& label[data-shrink="true"]': {
            // display: "none"
        },
        "& .MuiInputLabel-formControl": {
            "transform": "translate(0, 14px) scale(1)",
            "&.MuiInputLabel-shrink": {
                "transform": "translate(0, 0px) scale(0.75)",
            }
        },
        // "& .MuiInputLabel-formControl:not(.MuiInputLabel-outlined)" : {
        //     "transform": "translate(0, 16px) scale(1)",
        // },
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

        '&.MuiTextField-root': {
            borderRadius: "8px",
            padding: "0 0 0 16px",
            border: '1px solid #D2D2D6',
            "-webkit-transition": "border, background 300ms ease-out",
            "-moz-transition": "border, background 300ms ease-out",
            "-o-transition": "border, background 300ms ease-out",
            "transition": "border, background 300ms ease-out",

            "& input": {
                "font-family": "Inter",
                "font-style": "normal",
                "font-weight": "normal",
                "font-size": "13px",
                "line-height": "18px",
                "letter-spacing": "0.15px",
                "color": "#19191D",
                padding: 0,
                height: 18,
            },
            '&:hover:not(.Mui-disabled)': {
                backgroundColor: "#E5E5E7",
                borderColor: '#C8684C',
            },
            // "& "
            "& button": {
                top: -2,
                "&:hover": {
                    background: "none"
                }
            },

            '& + .Mui-focused': {
                backgroundColor: "red",
                border: '1px solid #C8684C',
            },
            '&.Mui-disabled input': {
                backgroundColor: "#F8F8F8",
                color: "#9696A0",
            },
        },
    },
})(KeyboardDatePicker);

export default function UiDatePicker(props) {
    const onChange = (e) => {
        const onChangeCallback = props.input ? props.input.onChange : props.onChange

        if (onChangeCallback) {
            onChangeCallback(e ? e.toDate() : null)
        }
    }

    const onBlur = () => {
        // props.input.onChange(e.valueOf())
    }

    const _id = useRef(props.id ? props.id : "ui-date-time-picker-" + Math.floor(Math.random() * Math.floor(10000)))
    const extProps = props.input ? props.input : props

    return <CssKeyboardDatePicker
        id={_id.current}
        className={"input-field"}
        disableToolbar
        variant="inline"
        format={"DD.MM.yyyy"}
        margin="normal"
        autoOk={true}
        label={props.label}
        {...extProps}
        value={extProps.value ? extProps.value : null}
        onChange={onChange}
        onBlur={onBlur}
        minDateMessage={'Дата должна быть после минимально возможной'}
        KeyboardButtonProps={{
            'aria-label': 'change date',
        }}
        readOnly={props.readOnly}
        disabled={props.disabled}
        InputProps={{
            disableUnderline: true,
        }}
    />
}

