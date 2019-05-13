import React from 'react'
import {Link} from 'react-router-dom';

export default class Warning extends React.Component {
    render() {
        return (
            <div className="register-block-wrapper__warning">
                    <p>{'Входя в аккаунт или регистрируясь, Вы принимаете наше '}
                        <Link to={'/doc/terms.pdf'} target="_blank">пользовательское соглашение</Link>{' и '}
                        <Link to={'/doc/privacy.pdf'} target="_blank">политику в отношении обработки персональных данных</Link>.
                    </p>
            </div>
        )
    }
}