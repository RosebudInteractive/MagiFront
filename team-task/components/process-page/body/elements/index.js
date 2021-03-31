import React from "react"
import "./elements.sass"
import {Field} from "redux-form";
import {ProcessElementsGrid} from "../../../ui-kit";

type ElementsProps  = {
    values: Array,
    activeElementId: number,
    elements: Array,
    editors: Array,
    onDelete: Function,
    onUpdate: Function,
    onAdd: Function,
}

export default function ProcessElements(props: ElementsProps) {

    return <div className="process-body__elements">
        <h6 className="process-elements__title _grey100">Элементы</h6>
        <ProcessElementsGrid {...props}/>
    </div>
}
