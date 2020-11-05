import React from 'react';
import {connect} from 'react-redux';
import {hideDiscountMenu, resultSelector, showDiscountMenuSelector,} from "ducks/header";
import DiscountItem from "./item";
import {bindActionCreators} from "redux";
import "./discount-menu.sass"
import $ from "jquery";
import {OverflowHandler} from "tools/overflow-handler";
import {isMobilePlatform} from "tools/page-tools";
import {localSettingsSelector} from "ducks/app";

class DiscountMenu extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            hidden: true,
            phoneMode: false
        }

        this._touchEventName = this.props.isMobileApp ? 'touchend' : 'mouseup'
        this._clickHandler = (e) => {
            const _isMenu = e.target.closest('.discount-menu')

            if (!this.state.hidden && !_isMenu) {
                this._hideMenu()
            }
        }

        this._resizeHandler = () => {
            let _isPhoneMode = ($(window).width() <= 414)

            if (this.state.phoneMode !== _isPhoneMode) {
                this.setState({phoneMode: _isPhoneMode})

                if (!this.props.visible) return

                if (_isPhoneMode) {
                    this._switchOnPhoneMode()
                } else {
                    this._switchOffPhoneMode()
                }
            }
        }
    }

    componentDidMount() {
        $(window).bind('resize', this._resizeHandler)
        this._resizeHandler()
        if (this.props.visible) {
            this.setState({hidden: false})
            document.body.addEventListener(this._touchEventName, this._clickHandler)
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            if (this.state.phoneMode) OverflowHandler.turnOnOverflowFixed()
            setTimeout(() => this.setState({hidden: false}), 0)
            document.body.addEventListener(this._touchEventName, this._clickHandler)
        }

        if (prevProps.visible && !this.props.visible) {
            this._forceHideMenu()
        }
    }

    componentWillUnmount() {
        document.body.removeEventListener(this._touchEventName, this._clickHandler)
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        const {result, visible} = this.props,
            {hidden,} = this.state,
            _dynamicList = this._getDiscountsList(result.dynamic, true),
            _commonList = this._getDiscountsList(result.other, false)

        const _style = this._getStyle()

        return visible && <div className={"discount-menu" + (hidden ? " _hidden" : "")} style={_style}>
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
                            <div className="discount-menu__title">Скидки на курсы</div>
                            {_commonList}
                        </div>
                }
            </div>
        </div>
    }

    _getDiscountsList(list, isDynamic) {
        return list.length ?
            list.map((item) => {
                return <DiscountItem course={item} dynamic={!!isDynamic} onClick={::this._forceHideMenu}/>
            })
            :
            null
    }

    _hideMenu() {
        this.setState({hidden: true})

        setTimeout(() => {
            if (OverflowHandler.enable) {
                OverflowHandler.turnOff()
            }
            this.props.actions.hideDiscountMenu()
        }, 300)
    }

    _forceHideMenu() {
        this.setState({hidden: true})

        if (OverflowHandler.enable) {
            OverflowHandler.turnOff()
        }
        this.props.actions.hideDiscountMenu()
    }

    _switchOnPhoneMode() {
        OverflowHandler.turnOnOverflowFixed()
    }

    _switchOffPhoneMode() {
        OverflowHandler.turnOff()
    }

    _getStyle() {
        const {localSettings} = this.props

        if (($(window).width() <= 414) && localSettings.appWrapperTop) {
            const _top = 63 + localSettings.appWrapperTop

            return {
                top: _top,
                height: `calc(100% - ${_top})`
            }
        }

        return null
    }
}

const mapState2Props = (state) => {
    return {
        result: resultSelector(state),
        visible: showDiscountMenuSelector(state),
        isMobileApp: state.app.isMobileApp,
        localSettings: localSettingsSelector(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({hideDiscountMenu}, dispatch)
    }
}


export default connect(mapState2Props, mapDispatch2Props)(DiscountMenu)
