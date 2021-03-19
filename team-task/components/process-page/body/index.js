import React, {useEffect, useRef, useMemo} from "react"
import "./body.sass"
import HeaderRow from "./header-row";
import Schema from "./schema"
import ProcessElements from "./elements";
import ProcessFields from "./fields";

type ProcessBodyProps = {
    process: any,
    editors: Array,
    supervisors: Array,
    onAddElement: Function,
    onUpdateElement: Function,
    onDeleteElement: Function,
}

export default function ProcessBody(props: ProcessBodyProps) {
    const {process, supervisors, editors} = props


    return <div className="process-page__body">
        <HeaderRow users={supervisors}/>
        <Schema/>
        <ProcessElements editors={editors} values={process.Elements} elements={[]} onAdd={props.onAddElement}
                         onUpdate={props.onUpdateElement} onDelete={props.onDeleteElement}/>
        <ProcessFields fields={process.ProcessFields}/>
    </div>
}
