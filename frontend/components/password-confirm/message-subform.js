import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

class MessageSubform extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        let {error} = this.props;

        let _text = error ? <p>{'При смене пароля произошла ошибка'} <br/>{error}</p> : <p>{'Смена пароля прошла успешно'}</p>

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

function mapStateToProps(state) {
    return {
        error: state.user.error,
    }
}

export default connect(mapStateToProps)(MessageSubform);