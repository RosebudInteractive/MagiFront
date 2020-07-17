import React from 'react';
import {connect} from 'react-redux';
import {countSelector, getDiscounts, getDiscountsAndShow, showDiscountMenuSelector} from "ducks/header";
import {bindActionCreators} from "redux";
import "./discount-button.sass"

const DISCOUNT_BUTTON = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#discount-btn"/>'

class DiscountButton extends React.Component {
    constructor(props) {
        super(props)

        this.props.actions.getDiscounts()
    }

    render() {
        const {count} = this.props

        return <div className={"discount-button" + (count ? " _active" : "")} onClick={::this._onButtonClick}>
            <svg width="14" height="17" dangerouslySetInnerHTML={{__html: DISCOUNT_BUTTON}}/>
            {!!count && <div className="counter">{count}</div>}
        </div>
    }

    _onButtonClick() {
        if (!this.props.showDiscountMenu) {
            this.props.actions.getDiscountsAndShow()
        }
    }
}

const mapState2Props = (state) => {
    return {
        count: countSelector(state),
        showDiscountMenu: showDiscountMenuSelector(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({getDiscounts, getDiscountsAndShow}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(DiscountButton)
