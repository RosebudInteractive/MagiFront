import React from 'react';
import {connect} from 'react-redux';

class ButtonsBlock extends React.Component {

    render() {
        const _google = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#google"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk-blue"/>',
            _facebook = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#facebook"/>';

        <div className="register-block">
            <p className="register-block__title">Регистрация с помошью</p>
            <a href="#" className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _google}}/>
                        </span>
                <span className="text">Google</span>
            </a>
            <a href="#" class="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span class="icon">
                            <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </span>
                <span class="text">Вконтакте</span>
            </a>
            <a href="#" className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span class="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _facebook}}/>
                        </span>
                <span class="text">Facebook</span>
            </a>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        title: state.player.title,
        subTitle: state.player.subTitle,
    }
}

export default connect(mapStateToProps)(ButtonsBlock);