import React, {useEffect, useRef, useState} from "react"
import {FormControl, InputLabel, MenuItem, Select, withStyles,} from "@material-ui/core"
import {makeStyles} from "@material-ui/core/styles"
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";

const CssFormControl = withStyles({
    root: {
        minHeight: "60px",
        maxWidth: '240px',
        '& label': {
            "font-family": "Inter",
            "font-size": "13px",
            "font-style": "normal",
            "font-weight": "400",
            "line-height": "15px",
            "letter-spacing": "0.15px",
            "text-align": "left",
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
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                border: "none",
            },
            '& fieldset legend': {
                display: "none"
            },
            // "& select": {
            "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                padding: "7px !important",
                border: '1px solid #D2D2D6',
                height: '60px',
                maxWidth: '240px',
                overflowX: 'auto',
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
                "color": "#f2ff48",
            },
            '&:hover .MuiSelect-select:not(.Mui-disabled)': {
                backgroundColor: "#E5E5E7",
                borderColor: '#C8684C',
            },
            '&.Mui-focused .MuiSelect-select': {
                border: '1px solid #C8684C',
            },
            '&.Mui-disabled .MuiSelect-select': {
                backgroundColor: "#F8F8F8",
                color: "#9696A0",
            },
        },
        "& .MuiListItem-gutters": {
            "font-family": "Inter",
            "font-size": 14,
            "font-style": "normal",
            "font-weight": 400,
            "line-height": "22px",
            "letter-spacing": "0.25px",
            "color": "#4A4B57"
        }
    },
})(FormControl);

const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    selectEmpty: {
        marginTop: theme.spacing(2)
    },
    menuPaper: {
        maxHeight: 200,

    },
    listItem: {
        fontFamily: "Inter",
        "font-size": "11px",
        "font-style": "normal",
        "font-weight": "400",
        "line-height": "12px",
        "letter-spacing": "0.25px",
        "text-align": "left",
        "min-height": "14px",
    }
}));


export default function UiMultiSelect(props) {
    const classes = useStyles();

    const id = useRef(),
        select = useRef()

    const [values, setValues] = useState(props.input.value);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;


        setValues(value);
    };

    useEffect(() => {
        id.current = props.id ? props.id : "ui-multi-select" + Math.floor(Math.random() * 10000)
    }, []);

    const propsObj = props.input ? props.input : props;

    const logClick = (e) => {
        console.log('menuitem clicked')
    }

    return <CssFormControl className={"input-field multi-select _with-custom-scroll" + (props.extClass ? " " + props.extClass : "")}>
        <InputLabel id={`label-for-${id.current}`}>{props.label}</InputLabel>
        <Select
            labelId={`label-for-${id.current}`}
            id={id.current}
            label={props.label}
            {...propsObj}
            variant="outlined"
            disabled={props.disabled}
            readOnly={props.readOnly}
            ref={select}
            renderValue={props.renderValue}
            MenuProps={{
                classes: { paper: classes.menuPaper },
                transitionDuration: 50,
                anchorEl: select.current,
                getContentAnchorEl: null,
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' }
            }}
        >

            {
                props.options && props.options.map((item, index) => (
                        <MenuItem onClick={logClick} key={index} value={item.id} classes={ {root: classes.listItem} }>
                            <Checkbox color={'default'} checked={props.input.value && props.input.value.indexOf(item.id) > -1}/>
                            <ListItemText primary={item.name} />
                        </MenuItem>
                    ))
            }
        </Select>
    </CssFormControl>
}
