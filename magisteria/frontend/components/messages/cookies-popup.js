import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {cookiesMessageClose, localSettingsSelector} from "ducks/app"
import {Link} from "react-router-dom";

class CookiesMessage extends React.Component {
    render() {
        return (
            !this.props.localSettings.popup.cookiesConfirmed ?
                <div className="balloon-wrapper js-cookies-popup">
                    <div className="balloon-wrapper_message">
                        <p className="balloon-wrapper_message__body">
                            {'В целях улучшения качества сервиса мы собираем и используем ' +
                            'cookie-файлы и некоторые другие данные на сайте в аналитических и маркетинговых целях. ' +
                            'Продолжая работу с сайтом, вы соглашаетесь на сбор и использование cookie-файлов и другой ' +
                            'информации в соответствии с '}
                            <Link to={'/doc/privacy.pdf'} target="_blank">Политикой в отношении обработки персональных
                                данных</Link>
                            {'.'}
                        </p>
                        <button type="button" className="balloon-wrapper__close" onClick={::this.props.confirm}>Закрыть
                        </button>
                    </div>
                </div>
                :
                null
        )

    }
}

function mapStateToProps(state) {
    return {
        localSettings: localSettingsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        confirm: bindActionCreators(cookiesMessageClose, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CookiesMessage);