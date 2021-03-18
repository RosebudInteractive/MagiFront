import React, {useEffect, useRef, useMemo} from "react"
// import TaskMainBlock from "./main-block";
// import RightBlock from "./right-block";
import "./body.sass"
import HeaderRow from "./header-row";
import Schema from "./schema"
import ProcessElements from "./elements";
import ProcessFields from "./fields";

type ProcessBodyProps = {
    // task: any,
    // elements: Array,
    // currentElement: any,
    // currentWriteFieldSet: ?string,
    users: Array,
    // isSupervisor: boolean,
}

export default function ProcessBody(props: ProcessBodyProps) {
    const {task, users, isSupervisor, currentElement,} = props

    return <div className="process-page__body">
        <HeaderRow users={users}/>
        <Schema />
        <ProcessElements/>
        <ProcessFields/>
        {/*<TaskMainBlock*/}
        {/*    isSupervisor={isSupervisor}*/}
        {/*    elements={props.elements}*/}
        {/*    currentElement={currentElement}*/}
        {/*    currentWriteFieldSet={props.currentWriteFieldSet}/>*/}
        {/*<RightBlock task={task} users={props.users} isSupervisor={isSupervisor}/>*/}
    </div>
}
