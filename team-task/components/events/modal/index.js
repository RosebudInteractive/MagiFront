import React from "react";
import PropTypes from "prop-types"


export default function Modal(props) { // todo maybe use it in different places?
    const {WrappedComponent, wrappedProps, customHeader, commonHeader, title, closeAction} = props;

    const closeModalForm = () => {
        closeAction();
    };

    return (
        <div className='outer-background'>
            <div className='inner-content'>
                {
                    !customHeader &&
                    <React.Fragment>
                        <button type="button" className="modal-form__close-button" onClick={closeModalForm}>Закрыть</button>
                        <div className="title">
                            <h6>{title}</h6>
                        </div>
                    </React.Fragment>
                }
                <WrappedComponent {...wrappedProps}/>
            </div>
        </div>
    )
}

Modal.propTypes = {
    WrappedComponent: PropTypes.object,
    wrappedProps: PropTypes.object,
    customHeader: PropTypes.bool,
    title: PropTypes.string,
    closeAction: PropTypes.func,
}

Modal.defaultProps = {
    customHeader: false
}
