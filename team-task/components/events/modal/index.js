import React, {useState} from "react";

export default function Modal(props) { // todo maybe use it in different places?
    const {WrappedComponent, wrappedProps, actions, commonHeader, title, closeAction} = props; //title is not nessessary if havnt commonHeader true

    // return (
    const [createAction, setActionCreate] = useState(true); //too use it but not here


    const closeModalForm = () => {
        closeAction();
    };


    return (
        <div className='outer-background'>
            <div className='inner-content'>
                {commonHeader &&
                <React.Fragment>
                    <button type="button" className="modal-form__close-button" onClick={closeModalForm}>Закрыть</button>
                    <div className="title">
                        <h6>
                            {title}
                        </h6>
                    </div>
                </React.Fragment>
                }


                <WrappedComponent {...wrappedProps}/>
            </div>
        </div>
    )
}
