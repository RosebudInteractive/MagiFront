import React from "react"
import "./filter.sass"

type ButtonProps = {
    opened: boolean,
    onClick: Function
}

export default function FilterButton(props: ButtonProps) {

    return <div className={"filter-button" + (props.opened ? " _opened" : " _closed")} onClick={props.onClick}>
        <div className="filter-button__title">Фильтры</div>
    </div>
}
