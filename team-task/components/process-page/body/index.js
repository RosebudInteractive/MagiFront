import React, {useEffect, useRef, useMemo} from "react"
import "./body.sass"
import HeaderRow from "./header-row";
import Schema from "./schema"
import ProcessElements from "./elements";
import ProcessFields from "./fields";

type ProcessBodyProps = {
    process: any,
    hasChanges: boolean,
    editors: Array,
    supervisors: Array,
    elements: Array,
    lessons: Array,
    onAddElement: Function,
    onUpdateElement: Function,
    onDeleteElement: Function,
    onAddTask: Function,
    onEditTask: Function,
    onDeleteTask: Function,
}

export default function ProcessBody(props: ProcessBodyProps) {
    const {process, supervisors, editors, elements, lessons} = props


    return <div className="process-page__body">
        <HeaderRow users={supervisors} lessons={lessons}/>
        <Schema tree={props.tree} onAddTask={props.onAddTask} onEditTask={props.onEditTask} onDeleteTask={props.onDeleteTask}/>
        <ProcessElements values={process.Elements}
                         disabled={props.hasChanges}
                         editors={editors}
                         elements={elements}
                         onAdd={props.onAddElement}
                         onUpdate={props.onUpdateElement}
                         onDelete={props.onDeleteElement}/>
        <ProcessFields fields={process.ProcessFields}/>
    </div>
}
