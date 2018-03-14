import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Progress from "./progress";
import Controls from "./controls";

import * as tools from '../../tools/time-tools'

import $ from 'jquery'
import PauseScreen from "./pause-screen";

export default class Frame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        content: PropTypes.array.isRequired,
        currentContent: PropTypes.number,
        onPause: PropTypes.func,
        onPlay: PropTypes.func,
        onSetRate:  PropTypes.func,
        onMute:  PropTypes.func,
        onGoToContent: PropTypes.func,
        playTime: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props)

        this.state = {
            pause: false,
            showContent: false,
            showRate:false,
            totalDurationFmt: '',
            totalDuration: 0,
            content: [],
            currentToc: 0,
            currentRate: 1,
        }
    }

    componentDidMount() {
        let tooltips = $('.js-speed, .js-contents, .js-share');
        $(document).mouseup(function (e) {
            if (tooltips.has(e.target).length === 0){
                tooltips.removeClass('opened');
            }
        });
    }


    _openContent() {
        this.setState({showContent : !this.state.showContent})
    }

    _openRate() {
        this.setState({showRate : !this.state.showRate})
    }

    _getContent() {
        let that = this;

        return this.state.content.map((item, index) => {
               return <li className={(this.state.currentToc === item.id) ? 'active' : ''} key={index} onClick={() => that._goToContent(item.begin, item.id)}>
                   <a href='#'>{item.title}</a>
               </li>
        })
    }

    _getRates() {
        let that = this;
        const _rates = [
            {value: 0.25}, // Todo : надо убрать 0.25
            {value: 0.5},
            {value: 0.75},
            {value: 1, title:'Обычная'},
            {value: 1.25},
            {value: 1.5},
            {value: 2},
        ];

        return _rates.map((item, index) => {
            return <li className={(this.state.currentRate === item.value) ? 'active' : ''} key={index} onClick={() => that._setRate(item.value)}>
                {item.title ? item.title : item.value}
            </li>
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.content !== nextProps.content) {
            this._calcContent(nextProps.content)
        }

        if (this.state.currentToc !== nextProps.currentContent) {
            this.setState({
                currentToc: nextProps.currentContent
            })
        }
    }

    _calcContent(content) {
        let length = 0;
        let _items = [];
        content.forEach((episodeContent) => {
            length += episodeContent.duration;

            episodeContent.content.forEach((item) => {
                _items.push({id: item.id, title : item.title, begin: item.begin})
            })
        })

        let _total = tools.getTimeFmt(length);

        this.setState({
            totalDurationFmt: _total,
            totalDuration: length,
            content: _items,
        })
    }

    _goToContent(begin, index) {
        this.props.onGoToContent(begin)
        this.setState({
            currentToc: index,
        })
    }

    _onPause() {
        if (this.state.pause) {
            this.props.onPlay()
        }
        else {
            this.props.onPause();
        }

        this.setState({
            pause : !this.state.pause
        })
    }

    _onBackward() {
        let _newPosition = (this.props.playTime < 10) ? 0 : (this.props.playTime - 10);
        this.props.onGoToContent(_newPosition);
    }

    _setRate(value) {
        if (this.props.onSetRate) {
            this.props.onSetRate(value)
            this.setState({currentRate: value})
        }
    }

    _onSetCurrentPosition(value) {
        this.props.onGoToContent(value);
    }

    render() {
        let _playTimeFrm = tools.getTimeFmt(this.props.playTime)

        const
            _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen"/>',
            _screen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#screen"/>'

        return (
            <div className="player-frame">
                <div className="player-frame__poster">
                    <div className='ws-container' id='player'>
                    </div>
                </div>
                {this.state.pause ? <PauseScreen onPlay={::this._onPause}/> : null}
                <div className="player-block">
                    <Progress total={this.state.totalDuration} current={this.props.playTime} content={this.state.content} onSetCurrentPosition={::this._onSetCurrentPosition}/>
                    <div className="player-block__row">
                        <Controls pause={this.state.pause} handlePauseClick={::this._onPause} handleBackwardClick={::this._onBackward}/>
                        <div className="player-block__stats">
                            <div className="player-block__info">
                                <span className="played-time">{_playTimeFrm}</span>
                                <span className="divider">/</span>
                                <span className="total-time">{this.state.totalDurationFmt}</span>
                            </div>
                            <button type="button" className="speed-button js-speed-trigger" onClick={::this._openRate}>
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                            </button>
                            <button type="button" className="content-button js-contents-trigger" onClick={::this._openContent}>
                                <svg width="18" height="12" dangerouslySetInnerHTML={{__html : _contents}}/>
                            </button>
                            <button type="button" className="fullscreen-button js-fullscreen">
                                <svg className="full" width="20" height="18" dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                                <svg className="normal" width="20" height="18" dangerouslySetInnerHTML={{__html: _screen}}/>
                            </button>
                        </div>
                        <div className={"contents-tooltip js-player-tooltip js-contents scrollable" + (this.state.showContent ? ' opened' : '')}>
                            <header className="contents-tooltip__header">
                                <p className="contents-tooltip__title">Оглавление</p>
                            </header>
                            <ol className="contents-tooltip__body">
                                {this._getContent()}
                            </ol>
                        </div>
                        <div className={"speed-tooltip js-player-tooltip js-speed" + (this.state.showRate ? ' opened' : '')}>
                            <header className="speed-tooltip__header">
                                <p className="speed-tooltip__title">Скорость</p>
                            </header>
                            <ul className="speed-tooltip__body">
                                {this._getRates()}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


{/*<img src={'/data/' + lesson.Cover} width="1025" height="577" alt=""/>*/}
{/*<div className="player-frame__poster-text">*/}
{/*<h2 className="player-frame__poster-title">«Физика» Аристотеля с греческим оригиналом на полях рукописи.</h2>*/}
{/*<p className="player-frame__poster-subtitle">Средневековый латинский манускрипт. Bibliotheca Apostolica Vaticana, Рим.</p>*/}
{/*</div>*/}

{/*<li className="active"><a href="#">«К чему эти смехотворные чудовища?»</a></li>*/}
{/*<li><a href="#">Строгие формы аббатства Фонтене</a></li>*/}
{/*<li><a href="#">Танцующие и плачущие святые</a></li>*/}
{/*<li><a href="#">«Эпоха образа до эпохи искусства»</a></li>*/}
{/*<li><a href="#">Категория стиля</a></li>*/}
{/*<li><a href="#">Стиль и политика</a></li>*/}