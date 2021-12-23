import React from "react";
import UserNavigator from "./user-navigator";
import FilterBlock from "./filter-block";
import './navigator.sass'
import PropTypes from "prop-types";
import SearchItem from "./search-item";
import $ from "jquery";

export default class Navigator extends React.Component {

    static propTypes = {
        isPhoneViewPort: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this._scrollHandler = (e) => {
            let _last = $('.header-menu__item').last(),
                _right = _last.offset().left + _last.innerWidth(),
                _row = $('.header-menu')

            let _first = $('.header-menu__item').first(),
                _left = _first.offset().left

            const _needHandle = Math.round(_right) > Math.round(_row.offset().left + _row.innerWidth()) ||
                Math.round(_left) < Math.round(_row.offset().left)

            if (!_needHandle) return

            const _delta = e.originalEvent.deltaY
            $(".navigation").scrollLeft(_delta)
            e.preventDefault()
        }

    }

    componentDidMount() {
        $(".navigation").bind("wheel", this._scrollHandler)
    }

    componentWillUnmount() {
        $(".navigation").unbind("wheel", this._scrollHandler)
    }

    render() {
        const {isPhoneViewPort} = this.props

        return <nav className="navigation">
                <ul className="header-menu">
                    {!isPhoneViewPort && <FilterBlock/>}
                    <UserNavigator isPhoneViewPort={isPhoneViewPort}/>
                    <SearchItem isPhoneViewPort={isPhoneViewPort}/>
                </ul>
            </nav>
    }
}
