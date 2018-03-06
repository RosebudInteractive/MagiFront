import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Frame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        content: PropTypes.array.isRequired,
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
        }
    }


    _openContent() {
        this.setState({showContent : !this.state.showContent})
    }

    _openRate() {
        this.setState({showRate : !this.state.showRate})
    }

    _hideTooltips(e) {
        if (e.target.className === "content-button js-contents-trigger") {
            return
        }

        // this.setState({
        //     showContent : false,
        //     showRate: false,
        // })
    }

    _getContent() {
        let that = this;

        return this.state.content.map((item, index) => {
               return <li className={(this.state.currentToc === index) ? 'active' : ''} key={index} onClick={() => that._goToContent(item.begin, index)}>
                   <a href='#'>{item.title}</a>
               </li>
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.content !== nextProps.content) {
            this._calcContent(nextProps.content)
        }
    }

    _calcContent(content) {
        let length = 0;
        let _items = [];
        content.forEach((episodeContent) => {
            length += episodeContent.duration;

            episodeContent.content.forEach((item) => {
                _items.push({title : item.title, begin: item.begin})
            })
        })

        let _total = this._getTimeFmt(length);

        this.setState({
            totalDurationFmt: _total,
            totalDuration: length,
            content: _items,
        })
    }

    _getTimeFmt(time) {
        let date = new Date(time * 1000),
            hh = date.getUTCHours(),
            mm = date.getUTCMinutes(),
            ss = date.getSeconds();

        return (hh ? (hh.toString() + ':') : '') +
            (hh ? mm.toString().padStart(2, '0') : mm.toString()) + ':' +
            ss.toString().padStart(2, '0')
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

    render() {
        let {playTime} = this.props;

        let _playTimeFrm = this._getTimeFmt(playTime),
            _playPercent = this.state.totalDuration ? ((playTime * 100)/this.state.totalDuration) : 0;

        const _backwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>',
            _sound = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>',
            _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen"/>',
            _screen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#screen"/>'


        return (
            <div className="player-frame" onClick={::this._hideTooltips}>
                <div className="player-frame__poster">
                    <div className='ws-container' id='player'>
                    </div>
                </div>
                <div className="player-block">
                    <div className="player-block__progress">
                        <div className="player-block__play" style={{width: _playPercent + '%'}}><span className="indicator"/></div>
                        <div className="player-block__time" style={{left: "30%"}}>{_playTimeFrm}</div>
                    </div>
                    <div className="player-block__row">
                        <div className="player-block__controls">
                            <button type="button" className="backwards">
                                <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _backwards}}/>
                            </button>
                            <button type="button" className="play-button" onClick={::this._onPause}>
                                <svg className="pause" width="11" height="18" dangerouslySetInnerHTML={{__html: (this.state.pause ? _playSmall : _pause)}}/>
                            </button>
                            <button type="button" className="sound-button">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _sound}}/>
                            </button>
                        </div>
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