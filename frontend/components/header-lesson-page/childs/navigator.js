import React from "react";
import PropTypes from "prop-types";
import $ from "jquery";
import {OverflowHandler} from "tools/page-tools";

export default class Navigator extends React.Component {

    static propTypes = {
        isNeedHideRefs: PropTypes.bool,
        episodes: PropTypes.array,
        courseIsPaid: PropTypes.bool
    }

    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            showToc: false,
        }
    }

    componentDidMount() {
        $(window).on('resize', ::this._toggleScrollableStyle)
    }

    componentWillUnmount() {
        $(window).unbind('resize', ::this._toggleScrollableStyle)
    }

    render() {
        let {isNeedHideRefs} = this.props,
            _sectionClassName = "lectures-menu__section section-nav js-section-nav" +
                (this.state.expanded ? ' expanded' : '')

        const _dots = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#dots"/>';

        return (
            <section className={_sectionClassName}>
                <button className="section-nav__trigger js-section-nav-trigger" onClick={::this._onTriggerClick}>
                    <span className="visually-hidden">Меню</span>
                    <svg width="4" height="18" dangerouslySetInnerHTML={{__html: _dots}}/>
                </button>
                <div className={"section-nav__list" + (isNeedHideRefs ? ' single' : '')}>
                    <ul className={"section-nav-list" + (isNeedHideRefs ? ' single' : '')}>
                        <li className={"section-nav-list__item js-section-menu-control" + (this.state.showToc ? ' expanded' : '')}
                            onClick={::this._switchToc}>
                            <a href="#transcript" className="section-nav-list__item-head js-scroll-link"
                               onClick={::this._onLinkMockClick}>Транскрипт</a>
                            <ol className={"section-nav-sublist" + (this.state.showToc ? ' show' : '')}>
                                {this._getList()}
                            </ol>
                        </li>
                        {
                            isNeedHideRefs
                                ?
                                null
                                :
                                <li className="section-nav-list__item" onClick={::this._onRecommendedClick}>
                                    <a href="#recommend" className="section-nav-list__item-head js-scroll-link"
                                       onClick={::this._onLinkMockClick}>Литература</a>
                                </li>
                        }

                    </ul>
                </div>
            </section>
        )
    }

    _hasToc() {
        let {episodes} = this.props;

        return episodes && episodes.some((episode) => {
            return (episode.Toc && episode.Toc.length)
        })
    }

    _getList() {
        if (!this.props.episodes) {
            return
        }

        return this.props.episodes.map((episode) => {
            return episode.Toc.map((item) => {
                const _id = 'toc' + item.Id;

                return <li className="section-nav-sublist__item current" key={_id}>
                    <a href={"#" + _id} className="section-nav-sublist__link"
                       onClick={(e) => {
                           e.preventDefault();
                           this._closeMenu();

                           let _item = $("#" + _id)
                           if (!_item || !_item.length) {
                               if (this.props.courseIsPaid) {
                                   this._scrollToPriceButton()
                               }

                               return
                           }

                           let position = _item.offset().top - 75;

                           $("body, html").animate({
                               scrollTop: position
                           }, 600);
                       }}>{item.Topic}</a>
                </li>
            })
        })
    }

    _scrollToPriceButton() {
        const _priceBlock = ($('.course-module__price-block'))

        if (_priceBlock && (_priceBlock.length)) {
            let _elemOffset = _priceBlock.offset().top,
                _elemHeight = _priceBlock.height()

            const _offset = _elemOffset - (($(window).height() / 2) - (_elemHeight / 2))

            $("body, html").animate({
                scrollTop: _offset
            }, 600);
        }
    }


    _closeMenu() {
        let _isMobile = window.innerWidth <= 899

        if (_isMobile) {
            this.setState({
                expanded: false
            })
        } else {
            this.setState({showToc: false})
        }
    }

    _switchToc(e) {
        if (this.state.showToc) {
            let _isToc = e.target.closest('.section-nav-sublist');
            if (!_isToc) {
                this.setState({showToc: false})
            }
        } else {
            if (!this._hasToc()) {
                let scrollTarget = $('#transcript').offset().top;

                $("body, html").animate({
                    scrollTop: scrollTarget
                }, 600);
            } else {
                this.setState({showToc: true})
            }
        }
    }

    _onTriggerClick() {
        this.setState({expanded: !this.state.expanded})
    }

    _onRecommendedClick() {
        let scrollTarget = $('#recommend').offset().top - 10;

        $("body, html").animate({
            scrollTop: scrollTarget
        }, 600);
    }

    _onLinkMockClick(e) {
        e.preventDefault()
    }

    componentDidUpdate(prevProps, prevState) {
        if ((prevState.showToc !== this.state.showToc) || (prevState.expanded !== this.state.expanded)) {
            this._toggleScrollableStyle()
        }
    }

    _toggleScrollableStyle() {
        let _isMobile = window.innerWidth <= 899,
            _menu =  _isMobile ? $('.section-nav__list') : $('.section-nav-sublist');

        if (_isMobile && !this.state.expanded) {
            OverflowHandler.turnOff();
            // $('body').removeClass('overflow');
            _menu.removeClass('scroll');
            return
        }

        if (_menu && _menu.length > 0) {
            let _menuTop = _menu.position().top,
                _menuBottom = _menuTop + _menu.height();

            if (_menuBottom > window.innerHeight) {
                OverflowHandler.rememberScrollPos();
                if (this.state.expanded) {
                    OverflowHandler.turnOn();
                }
                _menu.addClass('scroll');
            } else {
                OverflowHandler.turnOff();
                // $('body').removeClass('overflow');
                _menu.removeClass('scroll');
            }
        }
    }
}