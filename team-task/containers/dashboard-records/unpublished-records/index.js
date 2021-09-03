import React, {useState} from 'react';
import './unpublished-records.sass'

function UnpublishedRecords(props) {
    const [visible, setVisible] = useState(false);

    const toggleVisible = () => {
        setVisible(!visible);

        setTimeout(() => {
            $(window).trigger('toggle-elements-visible');
            props.resizeTriggerFn()
        }, 310)
    };

    return <div className={"unpublished-records-block" + (!visible ? " _hidden" : "")}>
        <div className="unpublished-records-wrapper">
            <h6 className="title _grey100">Неопубликованные лекции</h6>
            <div className="unpublished-records-grid">
                {/*<ProcessElementsGrid {...props}/>*/}
                <div className="elements__hide-button" onClick={toggleVisible}/>
            </div>
        </div>
    </div>
}

export default UnpublishedRecords;
