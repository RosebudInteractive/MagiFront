import React from 'react';
import {connect} from 'react-redux';
import {activeSelector, countSelector, getDiscounts, getDiscountsAndShow, showDiscountMenuSelector} from "ducks/header";
import { hideMenu } from "actions/page-header-actions";
import {bindActionCreators} from "redux";
import "./discount-button.sass"
import {OverflowHandler} from "tools/page-tools";

const DISCOUNT_BUTTON = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#discount-btn"/>'

class DiscountButton extends React.Component {
    constructor(props) {
        super(props)

        this.props.actions.getDiscounts()
    }

    render() {
        const {count, active} = this.props

        return <div className={"discount-button" + (active ? " _active" : "")} onClick={::this._onButtonClick}>
                <svg width="14" height="17" dangerouslySetInnerHTML={{__html: DISCOUNT_BUTTON}}/>
                {!!count && active && <div className="counter">{count}</div>}
                <div className="play-block__tooltip">Персональные скидки</div>
            </div>
    }

    _onButtonClick() {
        if (this.props.showMobileMenu) {
            this.props.actions.hideMenu()
            OverflowHandler.turnOff();
        }

        if (!this.props.showDiscountMenu) {
            this.props.actions.getDiscountsAndShow()
        }
    }
}

const mapState2Props = (state) => {
    return {
        count: countSelector(state),
        active: activeSelector(state),
        showDiscountMenu: showDiscountMenuSelector(state),
        showMobileMenu: state.pageHeader.showMenu
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({getDiscounts, getDiscountsAndShow, hideMenu}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(DiscountButton)
