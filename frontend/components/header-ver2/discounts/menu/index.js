import React from 'react';
import {connect} from 'react-redux';
import {hideDiscountMenu, resultSelector, showDiscountMenuSelector,} from "ducks/header";
import DiscountItem from "./item";
import {bindActionCreators} from "redux";
import "./discount-menu.sass"

class DiscountMenu extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            hidden: true
        }
        this._touchEventName = this.props.isMobileApp ? 'touchend' : 'mouseup'
        this._clickHandler = (e) => {
            const _isMenu = e.target.closest('.discount-menu')

            if (!this.state.hidden && !_isMenu) {
                this._hideMenu()
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            setTimeout(() => this.setState({hidden: false}), 0)
            document.body.addEventListener(this._touchEventName, this._clickHandler)
        }
    }

    componentWillUnmount() {
        document.body.removeEventListener(this._touchEventName, this._clickHandler)
    }

    render() {
        const {result, visible} = this.props,
            _dynamicList = this._getDiscountsList(result.dynamic, true),
            _commonList = this._getDiscountsList(result.other, false)

        return visible && <div className={"discount-menu" + (this.state.hidden ? " _hidden" : "")}>
            <div className="discount-menu__wrapper">
                {
                    _dynamicList &&
                        <div className="discount-menu__list">
                            <div className="discount-menu__title">Персональные скидки</div>
                            {_dynamicList}
                        </div>
                }
                {
                    _commonList &&
                        <div className="discount-menu__list">
                            <div className="discount-menu__title">Общие скидки</div>
                            {_commonList}
                        </div>
                }
            </div>
        </div>
    }

    _getDiscountsList(list, isDynamic) {
        return list.length ?
            list.map((item) => {
                return <DiscountItem course={item} dynamic={!!isDynamic}/>
            })
            :
            null
    }

    _hideMenu() {
        this.setState({hidden: true})

        setTimeout(() => {
            this.props.actions.hideDiscountMenu()
        }, 300)
    }
}

const mapState2Props = (state) => {
    return {
        result: resultSelector(state),
        visible: showDiscountMenuSelector(state),
        isMobileApp: state.app.isMobileApp,
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({hideDiscountMenu}, dispatch)
    }
}


export default connect(mapState2Props, mapDispatch2Props)(DiscountMenu)
