import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import $ from 'jquery'
import * as tools from '../../tools/time-tools'

import * as playerStartActions from '../../actions/player-start-actions'

class Progress extends React.Component {

    static propTypes = {
        total: PropTypes.number,
        // current: PropTypes.number,
        content: PropTypes.array,
        onSetCurrentPosition: PropTypes.func,
    };

    static defaultProps = {
        totalDuration: 0
    };

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
            _mouseTime = _mousePosition * this.props.total,
            _mouseTimeFmt = tools.getTimeFmt(_mouseTime);

        this.setState({
            mousePosition: _mousePosition,
            mouseTime: _mouseTime,
            mouseTimeFmt: _mouseTimeFmt
        })
    }

    _getGaps() {
        let {content, total} = this.props;

        return total ?
            content.map((item, index) => {
                let _position = (item.begin * 100) / total;
                return <div className="player-block__gap" style={{left: _position + '%'}} key={index}/>
            })
            :
            null
    }

    _setCurrentPosition(){
        this.props.playerStartActions.startSetCurrentTime(this.state.mouseTime)
    }

    render() {
        let {currentTime, total} = this.props;
        let _playPercent = total ? ((currentTime * 100) / total) : 0;

        return (
            <div className="player-block__progress" id={"timeline" + this.props.id} onClick={::this._setCurrentPosition}>
                <div className="player-block__play" style={{width: _playPercent + '%'}}>
                    <span className="indicator"/>
                </div>
                {this._getGaps()}
                {total ? <div className="player-block__time" style={{left: (this.state.mousePosition * 100) + "%"}}>{this.state.mouseTimeFmt}</div> : null}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentTime: state.player.currentTime,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Progress);