import React from 'react';
import {Link} from 'react-router-dom';

export default class MessageSubform extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        let {serverError} = this.props;

        let _text = serverError ? <p>{'При смене пароля произошла ошибка'} <br/>{serverError}</p> : <p>{'Смена пароля прошла успешно'}</p>

        return (
            <div className="popup js-popup _registration opened">
                <div className="register-block-wrapper">
                    <div className='register-block-wrapper__logo'/>
                    <div className="success-message">
                        <p className="success-message__text">{_text}</p>
                    </div>
                    <Link to={'/'}
                          className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="text">Ок</span>
                    </Link>
                </div>

            </div>
        )
    }
}