import React, {useState} from "react";
import {DatePicker} from "../../../components/ui-kit";
import "./confirmation-of-publication.sass"

function ConfirmationOfPublication(props) {

    const [value, setValue] = useState(null);

    return (
        <div className="confirmation-of-publication">

            <div>{props.CourseName + ', ' + props.LessonName}</div>

            <DatePicker
                        value={props.DateObject}
                        // onChange={(e) => {
                        //
                        //     console.log('onchange inside modal');
                        //     console.log(e)
                        >
                {/*<input onChange={(e) => {*/}
                {/*    console.log('onchange inside modal');*/}
                {/*    console.log(e)*/}
                {/*}}/>*/}
            </DatePicker>

            <div className="actions">
                <button type={"button"} className={'cancel big-button'}>Отмена</button>
                <button type={"button"} onClick={() => {
                    console.log('save process')}} className={'orange-button big-button'}>Сохранить</button>
            </div>

        </div>
    )
}

export default ConfirmationOfPublication;
