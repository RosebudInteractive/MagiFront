import React, {useState} from "react"
import "./elements.sass"
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

    const [visible, setVisible] = useState(true)

    const toggleVisible = () => {
        setVisible(!visible)

        setTimeout(() => {
            $(window).trigger('toggle-elements-visible');
        }, 310)
    }

    return <div className={"process-body__elements" + (!visible ? " _hidden" : "")}>
        <div className="process-body__elements-wrapper">
            <h6 className="process-elements__title _grey100">Элементы</h6>
            <div className="process-body__elements-grid">
                <ProcessElementsGrid {...props}/>
                <div className="elements__hide-button" onClick={toggleVisible}/>
            </div>
        </div>
    </div>
}
