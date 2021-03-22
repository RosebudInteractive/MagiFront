import React, {useState, useEffect} from "react"
import Icon from "tt-assets/svg/filter-button.svg"
import "./filter.sass"

type ButtonProps = {
    onClick: Function
}

export default function FilterButton(props: ButtonProps) {

    return <div className="filter-button" onClick={props.onClick}>
        <Icon/>
        <div className="filter-button__title">Фильтры</div>
    </div>
}
