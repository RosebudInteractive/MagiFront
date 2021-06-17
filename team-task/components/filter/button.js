import React from "react"
import "./filter.sass"

type ButtonProps = {
    opened: boolean,
    active: boolean,
    onClick: Function
}

export default function FilterButton(props: ButtonProps) {

    return <div className={"filter-button" + (props.opened ? " _opened" : " _closed") + (props.active ? " _active" : "")} onClick={props.onClick}>
        <div className="filter-button__title">Фильтры</div>
    </div>
}
