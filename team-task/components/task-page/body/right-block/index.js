import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import TextBox from "../../../ui-kit/text-box";
import SupervisorBlock from "./supervisor-block";
import ProcessFields from "./process-fields";
import "./right-block.sass"

type TaskBodyProps = {
    hasChanged: boolean,
    task: any,
    isSupervisor: boolean,
}

export default function RightBlock(props: TaskBodyProps) {
    const {hasChanged, isSupervisor, task} = props

    return <div className="body__right-block">
        <div className={"right-block__description"}>
            <Field component={TextBox} name={"Description"} label={"Описание"}/>
        </div>

        {isSupervisor && <SupervisorBlock hasChanged={hasChanged} task={task}/>}
        <ProcessFields fields={task.Fields}/>
    </div>
}
