import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {
    transactionsSelector,
    loadingSelector,
    getTransactionHistory,
    getSubscriptionInfo,
} from '../../../ducks/profile'
import {bindActionCreators} from "redux";
import * as storageActions from "../../../actions/lesson-info-storage-actions";
import Item from "./transaction-item";
import AutoPayHeader from "./auto-pay-header";
import StatusHeader from "./status-header";

const _pagingSize = 3;

class SubscriptionBlock extends React.Component {

    static propTypes = {
        active: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this._visibleCount = 0;
    }

    componentWillMount() {
        this.props.storageActions.refreshState();
        this.props.getTransactionHistory();
        this.props.getSubscriptionInfo()
    }

    componentDidMount() {
    }

    componentDidUpdate() {
        if ((this._visibleCount === 0) && (this.props.transactions.size > 0)) {
            this._getMoreTransactions();
        }
    }

    _getList() {
        let {transactions, loading} = this.props,
            _result = [];

        if (loading || transactions.size === 0) {
            return null
        }

        for (let i = 0; i < this._visibleCount; i++) {
            _result.push(<Item item={transactions.get(i)} key={i}/>)
        }

        return _result
    }

    _getMoreTransactions() {
        let {transactions} = this.props,
            _newSize = this._visibleCount + _pagingSize,
            _oldSize = this._visibleCount;

        this._visibleCount = (_newSize) < transactions.size ? _newSize : transactions.size;

        if (_oldSize !== this._visibleCount) {
            this.forceUpdate();
        }
    }

    _getButton() {
        let {transactions} = this.props;

        return ((this._visibleCount < transactions.size) && (transactions.size > 0))
            ?
            <button className="btn btn--rounded subscription-history__btn"
                    onClick={::this._getMoreTransactions}>{'Загрузать еще ' + _pagingSize}</button>
            :
            null
    }

    render() {
        return (
            <div className={"profile-block__tab" + (this.props.active ? " active" : "")}>
                <div className="subscription-info">
                    <div className="subscription-info__wrapper">
                        <AutoPayHeader/>
                        <StatusHeader/>
                        <div className="subscription-history">
                            <h2>История платежей</h2>
                            {this._getList()}
                            {this._getButton()}
                        </div>
                    </div>


                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        transactions: transactionsSelector(state),
        loading: loadingSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        storageActions: bindActionCreators(storageActions, dispatch),
        getTransactionHistory: bindActionCreators(getTransactionHistory, dispatch),
        getSubscriptionInfo: bindActionCreators(getSubscriptionInfo, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionBlock);