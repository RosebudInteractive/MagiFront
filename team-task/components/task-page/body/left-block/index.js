import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import {TextBox, Select} from "../../../ui-kit";
import CommentBlock from "./сomment-block";
import "./left-block.sass"

type TaskBodyProps = {
    hasChanged: boolean,
    task: any,
}

export default function LeftBlock(props: TaskBodyProps) {
    const {task,} = props

    return <div className="body__left-block">
        <Field component={TextBox} name={"Executor"} label={"Испольнитель"}/>
        <Field component={Select} name={"State"} label={"Состояние"}/>
        <Field component={TextBox} name={"LastComment"} label={"Комментарий"}/>
        <CommentBlock task={task}/>
    </div>
}
