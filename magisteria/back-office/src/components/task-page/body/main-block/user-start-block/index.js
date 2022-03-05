import React from "react";
import "./user-start-block.sass"

type UserBlockProps = {
    onStartClick: Function
}

export function UserStartBlock(props: UserBlockProps) {
    return <div className="body__user-start-block">
        <div className="font-h8 _grey100">Чтобы начать выполнение задачи,  подтвердите действие:</div>
        <button className="user-start-block__start-button orange-button big-button" onClick={props.onStartClick}>Взять в работу</button>
    </div>
}
