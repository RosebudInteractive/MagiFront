import React from "react"
import {FormControl, InputLabel, Select, MenuItem, withStyles, TextField} from "@material-ui/core"

const CssFormControl = withStyles({
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
        '& label[data-shrink="true"]': {
            // display: "none"
        },
        "& .MuiInputLabel-root": {
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
            "&.MuiFormLabel-filled": {
                opacity: 0,
            }
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                border: "none",
            },
            '& fieldset legend': {
                display: "none"
            },
            "& select": {
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
                "line-height": "15px",
                "letter-spacing": "0.15px",
                "color": "#19191D",

            },
            '&:hover select:not(.Mui-disabled)': {
                backgroundColor: "#E5E5E7",
                borderColor: '#C8684C',
            },
            '&.Mui-focused select': {
                border: '1px solid #C8684C',
            },
            '&.Mui-disabled select': {
                backgroundColor: "#F8F8F8",
                color: "#9696A0",
            },
        },
    },
})(FormControl);


export default function UiSelect(props) {

    const _id = props.id ? props.id : "ui-select-" + Math.floor(Math.random() * Math.floor(10000))

    return <CssFormControl className={"input-field"}>
        <InputLabel id={_id}>{props.label}</InputLabel>
        <Select
            labelId={_id}
            id="demo-simple-select-autowidth"
            label={props.label}
            {...props.input}
            // onChange={handleChange}
            variant="outlined"
            native
        >
            <option value=""/>
            {
                props.options && props.options.map(item => <option value={item.id}>{item.name}</option>)
            }
        </Select>
        {/*<FormHelperText>Auto width</FormHelperText>*/}
    </CssFormControl>


    // return <Select  {...props.input} className={"input-field" + (props.extClass ? props.extClass : "")}/>
}
