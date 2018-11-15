import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

class AuthErrorForm extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // this.props.hash = '';
    }

    getParameterByName(name) {
        let url = this.props.params;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    render() {
        let _message = this.getParameterByName('message');

        let _text = <p>{'При авторизации произошла ошибка'} <br/>{_message}</p>

        return (
            <div className="popup js-popup _registration opened no-transition">
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

function mapStateToProps(state, ownProps) {
    return {
        params: ownProps.location.search,
        hash: ownProps.location.hash,
    }
}

export default connect(mapStateToProps)(AuthErrorForm);