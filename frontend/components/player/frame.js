import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Frame extends Component {
    static propTypes = {
        lesson: PropTypes.object.isRequired,
        onPause: PropTypes.func,
    };

    render() {
        let {lesson} = this.props;

        const _backwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _sound = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>',
            _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen"/>',
            _screen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#screen"/>'



        return (
            <div className="player-frame" >
                <div className="player-frame__poster" id='player'>
                    <img src={'/data/' + lesson.Cover} width="1025" height="577" alt=""/>
                    <div className="player-frame__poster-text">
                        <h2 className="player-frame__poster-title">«Физика» Аристотеля с греческим оригиналом на полях рукописи.</h2>
                        <p className="player-frame__poster-subtitle">Средневековый латинский манускрипт. Bibliotheca Apostolica Vaticana, Рим.</p>
                    </div>
                </div>
                <div className="player-block">
                    <div className="player-block__progress">
                        <div className="player-block__load" style={{width: "33.5%"}}/>
                        <div className="player-block__play" style={{width: "20%"}}><span className="indicator"/></div>
                        <div className="player-block__gap" style={{eft: "5%"}}/>
                        <div className="player-block__time" style={{left: "30%"}}>50:01</div>
                    </div>
                    <div className="player-block__row">
                        <div className="player-block__controls">
                            <button type="button" className="backwards">
                                <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _backwards}}/>
                            </button>
                            <button type="button" className="play-button" onClick={this.props.onPause}>
                                <svg className="pause" width="11" height="18" dangerouslySetInnerHTML={{__html: _pause}}/>
                            </button>
                            <button type="button" className="sound-button">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _sound}}/>
                            </button>
                        </div>
                        <div className="player-block__stats">
                            <div className="player-block__info">
                                <span className="played-time">20:01</span>
                                <span className="divider">/</span>
                                <span className="total-time">1:35:54</span>
                            </div>
                            <button type="button" className="speed-button js-speed-trigger">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                            </button>
                            <button type="button" className="content-button js-contents-trigger">
                                <svg width="18" height="12" dangerouslySetInnerHTML={{__html : _contents}}/>
                            </button>
                            <button type="button" className="fullscreen-button js-fullscreen">
                                <svg className="full" width="20" height="18" dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                                <svg className="normal" width="20" height="18" dangerouslySetInnerHTML={{__html: _screen}}/>
                            </button>
                        </div>
                        <div className="contents-tooltip js-player-tooltip js-contents scrollable">
                            <header className="contents-tooltip__header">
                                <p className="contents-tooltip__title">Оглавление</p>
                            </header>
                            <ol className="contents-tooltip__body">
                                <li className="active"><a href="#">«К чему эти смехотворные чудовища?»</a></li>
                                <li><a href="#">Строгие формы аббатства Фонтене</a></li>
                                <li><a href="#">Танцующие и плачущие святые</a></li>
                                <li><a href="#">«Эпоха образа до эпохи искусства»</a></li>
                                <li><a href="#">Категория стиля</a></li>
                                <li><a href="#">Стиль и политика</a></li>
                            </ol>
                        </div>
                        <div className="speed-tooltip js-player-tooltip js-speed">
                            <header className="speed-tooltip__header">
                                <p className="speed-tooltip__title">Скорость</p>
                            </header>
                            <ul className="speed-tooltip__body">
                                <li>0.25</li>
                                <li>0.5</li>
                                <li>0.75</li>
                                <li className="active">Обычная</li>
                                <li>1.25</li>
                                <li>1.5</li>
                                <li>2</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}