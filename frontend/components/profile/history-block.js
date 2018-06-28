import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {userHistorySelector, loadingSelector, getUserHistory} from '../../ducks/profile'
import {bindActionCreators} from "redux";
import * as storageActions from "../../actions/lesson-info-storage-actions";
import Item from "./history-item";

const _pagingSize = 10;

class HistoryBlock extends React.Component {

    static propTypes = {
        active: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this._visibleCount = 0;
    }

    componentWillMount() {
        this.props.storageActions.refreshState();
        this.props.getUserHistory();
    }

    componentDidMount() {
    }

    componentDidUpdate() {
        if ((this._visibleCount === 0) && (this.props.history.length > 0)) {
            this._getMoreHistory();
        }
    }

    _getList() {
        let {history} = this.props,
            _result = [];

        for (let i = 0; i < this._visibleCount; i++) {
            _result.push(<Item item={history[i]} key={i}/>)
        }

        return _result
    }

    _getMoreHistory() {
        let {history} = this.props,
            _newSize = this._visibleCount + _pagingSize,
            _oldSize = this._visibleCount;

        this._visibleCount = (_newSize) < history.length ? _newSize : history.length;

        if (_oldSize !== this._visibleCount) {
            this.forceUpdate();
        }
    }

    render() {
        let {history} = this.props;

        return (
            <div className={"profile-block__tab" + (this.props.active ? " active" : "")}>
                <div className="history-list">
                    {this._getList()}
                    {
                        ((this._visibleCount < history.length) && (history.length > 0))
                            ?
                            <button className="btn btn--white history-list__link"
                                    onClick={::this._getMoreHistory}>Больше лекций</button>
                            :
                            null
                    }

                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        history: userHistorySelector(state),
        loading: loadingSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        storageActions: bindActionCreators(storageActions, dispatch),
        getUserHistory: bindActionCreators(getUserHistory, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryBlock);