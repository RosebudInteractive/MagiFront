import React from 'react';
import PropTypes from 'prop-types';

export default class PauseScreen extends React.Component{
    static propTypes = {
        isMain: PropTypes.bool,
        onPlay: PropTypes.func,
        duration: PropTypes.string,
        number: PropTypes.number,
    };

    static defaultProps = {
        isMain: true,
    };

    _onPlay() {
        if (this.props.onPlay) {
            this.props.onPlay()
        }
    }

    render() {
        return(
            <div className="player-frame__screen">
                <div className="lecture-frame">
                    <div className="lecture-frame__header">
                        <a href="#" className="lecture-frame__play-link">
                            {!this.props.isMain ? <button type="button" className="lecture-frame__plus">Доп. эпизод</button> : null}
                            <h2 className="lecture-frame__title">
                                <span className="lecture-frame__duration">10:34</span>
                                <span className="play-btn-big lecture-frame__play-btn" onClick={::this._onPlay}>Воспроизвести</span>
                                <span className="title-text">
                                            <span className="number">10.</span> Новизна и своеобразие буддизма в&nbsp;духовной культуре древней Индии.
                                        </span>
                            </h2>
                            <div className="lecture-frame__text-block">
                                <p className="lecture-frame__descr">Вступительная беседа о достоинствах и недостатках цивилизационного подхода к истории, о критериях или маркерах цивилизации.</p>
                                <p className="lecture-frame__author">Олег Лекманов</p>
                                <p className="lecture-frame__chapter">Название главы</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        )
    }
}