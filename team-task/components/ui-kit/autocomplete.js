import React, {useEffect, useMemo, useRef, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import {Autocomplete} from '@material-ui/lab';
import {withStyles} from "@material-ui/core";

const CssAutocomplete = withStyles({
    root: {
        minHeight: "48px",
        '& label': {
            "font-family": "Inter",
            "font-size": "13px",
            "font-style": "normal",
            "font-weight": "400",
            "line-height": "15px",
            "letter-spacing": "0.15px",
            "text-align": "left",
        },
        "& .MuiInputLabel-outlined": {
            "z-index": "1",
            opacity: 1,
            "transform": "translate(16px, 15px) scale(1)",
            "-webkit-transition": "opacity 300ms ease-out, color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
            "-moz-transition": "opacity 300ms ease-out, color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
            "-o-transition": "opacity 300ms ease-out, color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
            "transition": "opacity 300ms ease-out, color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
            "&.Mui-focused": {
                color: "#C8684C"
            },
            "&.MuiInputLabel-shrink": {
                "transform": "translate(16px, 2px) scale(0.75)",
            },
        },
        '& .MuiOutlinedInput-root': {
            minHeight: "48px",
            padding: "6px 16px",
            borderRadius: "8px",
            border: '.5px solid #D2D2D6',
            "-webkit-transition": "border, background 300ms ease-out",
            "-moz-transition": "border, background 300ms ease-out",
            "-o-transition": "border, background 300ms ease-out",
            "transition": "border, background 300ms ease-out",
            "font-family": "Inter",
            "font-style": "normal",
            "font-weight": "normal",
            "font-size": "13px",
            "line-height": "15px",
            "letter-spacing": "0.15px",
            "color": "#19191D",
            "& fieldset": {
                display: "none",
            },
            "& input": {
                padding: "0 !important"
            },
            '&:hover:not(.Mui-disabled)': {
                backgroundColor: "#E5E5E7",
                borderColor: '#C8684C',
            },
            '&.Mui-disabled': {
                backgroundColor: "#F8F8F8",
                color: "#9696A0",
            },
        },

    },
})(Autocomplete);

export default function UiAutocomplete(props) {
    const {options} = props

    const [value, setValue] = useState(null);
    const id = useRef()

    useEffect(() => {
        id.current = props.id ? props.id : "ui-autocomplete-" + Math.floor(Math.random() * 10000)
    }, [])

    const onChange = (event, newValue) => {
        const _item = options.find(item => item.name === newValue)

        if (_item) {
            props.input.onChange(_item.id)
        }
    }

    useEffect(() => {
        if (props.input.value) {
            const _item = options.find(item => item.id === props.input.value)
            setValue(_item.name)
        } else {
            setValue(null)
        }
    }, [props.input.value])

    const _options = useMemo(() => { return options.map(item => item.name) }, [options])

    return <CssAutocomplete className={"input-field" + (props.extClass ? " " + props.extClass : "")}
                            id={id.current}
                            value={value}
                            disabled={props.disabled}
                            readOnly={props.readOnly}
                            onChange={onChange}
                            options={_options}
                            renderInput={(params) => <TextField {...params}
                                                                label={props.label}
                                                                variant="outlined"/>}
    />
}
