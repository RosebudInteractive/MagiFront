import React from 'react';
// import {bindActionCreators} from 'redux';
// import {connect} from 'react-redux';

import $ from 'jquery'
import * as tools from '../../../tools/time-tools'
import PropTypes from 'prop-types'

export default class Progress extends React.Component {

    static propTypes = {
        onSetPosition: PropTypes.func,
        currentTime: PropTypes.number,
        bufferedTime: PropTypes.number,
        contentArray: PropTypes.array,
        totalDuration: PropTypes.number,
    }

    constructor(props) {
        super(props);
        this.state = {
            mousePosition: 0,
            mouseTime: 0,
            mouseTimeFmt: '',
        }
    }

    componentDidMount() {
        $("#timeline" + this.props.id).mousemove((event) => {
            let _current = event.pageX - event.currentTarget.offsetLeft,
                _total = event.currentTarget.offsetWidth - 1;

            this._calcMousePosition(_current, _total)
        });
    }

    _calcMousePosition(current, total) {
        let _mousePosition = total ? (current / total) : 0,
            _mouseTime = _mousePosition * this.props.totalDuration,
            _mouseTimeFmt = tools.getTimeFmt(_mouseTime);

        this.setState({
            mousePosition: _mousePosition,
            mouseTime: _mouseTime,
            mouseTimeFmt: _mouseTimeFmt
        })
    }

    _getGaps() {
        let {contentArray, totalDuration} = this.props;

        return totalDuration ?
            contentArray.map((item, index) => {
                let _position = (item.begin * 100) / totalDuration;
                return <div className="player-block__gap" style={{left: _position + '%'}} key={index}/>
            })
            :
            null
    }

    _setCurrentPosition(){
        this.props.onSetPosition(this.state.mouseTime)
    }

    render() {
        let {currentTime, bufferedTime, totalDuration} = this.props;
        let _playPercent = totalDuration ? ((currentTime * 100) / totalDuration) : 0,
            _bufferedPercent = totalDuration ? ((bufferedTime * 100) / totalDuration) : 0;

        return (
            <div className="player-block__progress" id={"timeline" + this.props.id} onClick={::this._setCurrentPosition}>
                <div className='player-block__timeline'/>
                <div className="player-block__load" style={{width: _bufferedPercent + '%'}}/>
                <div className="player-block__play" style={{width: _playPercent + '%'}}>
                    <span className="indicator"/>
                </div>
                {this._getGaps()}
                {totalDuration ? <div className="player-block__time" style={{left: (this.state.mousePosition * 100) + "%"}}>{this.state.mouseTimeFmt}</div> : null}
            </div>
        );
    }
}

// function mapStateToProps(state) {
//     return {
//         // currentTime: state.player.currentTime,
//         // bufferedTime: state.player.bufferedTime,
//         // contentArray: state.player.contentArray,
//         // totalDuration: state.player.totalDuration,
//     }
// }
//
// function mapDispatchToProps(dispatch) {
//     return {
//         // playerStartActions: bindActionCreators(playerStartActions, dispatch),
//     }
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(Progress);