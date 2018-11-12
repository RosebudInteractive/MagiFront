import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'

import LessonsListWrapper from './lessons-list-wrapper';
import {bindActionCreators} from "redux";
import * as appActions from "../../actions/app-actions";
import {connect} from "react-redux";

class Menu extends React.Component {

    static propTypes = {
        courseTitle: PropTypes.string,
        courseUrl: PropTypes.string,
        current: PropTypes.string,
        total: PropTypes.number,
        episodes: PropTypes.array,
        isNeedHideGallery: PropTypes.bool,
        isNeedHideRefs: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this._isDesktopWidth = $(window).outerWidth() > 899;

        this.state = {
            opened: false,
            showToc: !this._isDesktopWidth,
            showNavigationButtons: false,
        }

        this._mediaQuery = window.matchMedia("(orientation: portrait)");

        let that = this;
        this._mediaQueryHandler = (m) => {
            let _newWidth = $(window).outerWidth()

            if (m.matches) {
                // Changed to portrait
                let _chromeBug = $(window).outerHeight() < $(window).outerWidth()
                if (_chromeBug) {
                    _newWidth = $(window).outerHeight();
                }
            }
            else {
                // 'Changed to landscape'
                let _chromeBug = $(window).outerHeight() > $(window).outerWidth()
                if (_chromeBug) {
                    _newWidth = $(window).outerHeight();
                }
            }

            let _newWidthIsDesktop = _newWidth > 899;

            if (that._isDesktopWidth !== _newWidthIsDesktop) {
                that._isDesktopWidth = _newWidthIsDesktop;
                that._handleSetNewWidth()
            }
        };

        this._resizeHandler = () => {
            let _newWidthIsDesktop = $(window).outerWidth() > 899;

            if (that._isDesktopWidth !== _newWidthIsDesktop) {
                that._isDesktopWidth = _newWidthIsDesktop;
                that._handleSetNewWidth()
            }
        }

        this._mouseupHandler = (e) => {
            let _isButton = e.target.closest('#Content') ||
                (e.target.closest('.menu-nav-sublist__item') && that._isDesktopWidth) ||
                e.target.closest('.lectures-menu-nav__trigger');

            if (!_isButton) {
                if (that.state.showToc) {
                    that._switchToc()
                }

                if (!that._isDesktopWidth && that.state.showNavigationButtons) {
                    that.setState({
                        showNavigationButtons: false,
                    })
                }
            }
        }
    }

    _handleSetNewWidth() {
        if (this._isDesktopWidth) {
            if (this.state.showToc) {
                this._switchToc()
            }

            if (this.state.showNavigationButtons) {
                this.setState({showNavigationButtons: false})
            }

            $('.menu-nav-list').height('auto')
            $('.menu-nav-list').show()
        } else {
            $('.menu-nav-list').hide()
            if (!this.state.showToc) {
                this._switchToc()
            }
        }

        this._setNavigationMenuWidth();
    }

    componentDidMount() {
        if (this.props.isMobileApp) {
            this._mediaQuery.addListener(this._mediaQueryHandler)
        } else {
            $(window).resize(this._resizeHandler)
        }

        $('.App').mouseup(this._mouseupHandler)
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
        $('.App').unbind('mouseup', this._mouseupHandler)
        this._mediaQuery.removeListener(this._mediaQueryHandler)
    }

    _switchMenu() {
        if (this.props.isLessonMenuOpened) {
            this.props.appActions.hideLessonMenu()
        } else {
            this.props.appActions.showLessonMenu()
        }

        $(window).on('scroll', (e) => {
            console.log(e.target.className)
        })
    }

    _switchToc() {
        let _willBeOpen = !this.state.showToc || !this._isDesktopWidth;

        if (_willBeOpen) {
            $('.menu-nav-sublist').show()
            if (this._isDesktopWidth) {
                let _top = $('.menu-nav-sublist').offset().top - window.scrollY,
                    _bottom = $(window).innerHeight(),
                    _height = _bottom - _top;

                $('.menu-nav-sublist').css('max-height', _height)
            } else {
                $('.menu-nav-sublist').css('max-height', 'none')
            }
        } else {
            $('.menu-nav-sublist').css('max-height', '0')
            $('.menu-nav-sublist').hide()
        }

        this.setState({showToc: !this.state.showToc || !this._isDesktopWidth})
    }

    _switchNavigation() {
        let _willBeOpen = !this.state.showNavigationButtons;

        if (_willBeOpen && !this._isDesktopWidth) {
            $('.menu-nav-list').show()
            let _top = $('.menu-nav-list').offset().top - window.scrollY,
                _bottom = $(window).innerHeight(),
                _height = _bottom - _top;

            $('.menu-nav-list').height(_height)
        }

        this.setState({showNavigationButtons: !this.state.showNavigationButtons})
    }


    componentWillReceiveProps() {

    }

    componentDidUpdate() {
        this._setNavigationMenuWidth()
    }

    _hasToc() {
        let {episodes} = this.props;

        return episodes && episodes.some((episode) => {
            return (episode.Toc && episode.Toc.length)
        })
    }

    _setNavigationMenuWidth() {
        if (this._isDesktopWidth) {
            $('.js-lectures-menu-nav').css('width', $('.lectures-menu-nav__list').width());
            let _items = $('.menu-nav-list__item');
            if (_items.length > 0) {
                let _width = 100 / _items.length;
                _items.css('width', _width + '%');
            }
        } else {
            $('.js-lectures-menu-nav').css('width', '');
        }
    }

    _scrollToTop() {
        let $target = $("#text"),
            targetOffset = $target.offset().top;

        let _currentPosition = $(window).scrollTop(),
            _delta = 0;

        if (_currentPosition > targetOffset) {
            _delta = ($(window).outerWidth() > 899) ? 175 : 125
        } else {
            _delta = 75
        }

        targetOffset -= _delta;
        $('html, body').scrollTop(targetOffset)

        // if ($target.length) {
        //
        //     // trigger scroll
        //     $('html, body').animate({
        //         scrollTop: targetOffset
        //     }, 0);
        // }
    }

    render() {
        let {isNeedHideGallery, isNeedHideRefs} = this.props;

        const _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>',
            _style = {"white-space": 'nowrap'};

        return (
            <div className="page-header__row lectures-menu-row">
                <div className={"lectures-menu" + (this.props.isLessonMenuOpened ? ' opened' : '')}>
                    <div className="lectures-menu__section transcript">
                        <Link to={'/category/' + this.props.courseUrl} className="lectures-menu__link-back transcript">
                            <div className="icon">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _linkBack}}/>
                            </div>
                            <span><span className="label">Курс:</span>{' ' + this.props.courseTitle}</span>
                        </Link>
                    </div>
                    <div className="lectures-menu__section lectures-list-block">
                        <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                                onClick={::this._switchMenu}><span>Лекция </span>
                            <span className="num">
                                <span className="current">
                                    {this.props.current}
                                </span>
                                {'/' + this.props.total}
                            </span>
                        </button>
                        <LessonsListWrapper {...this.props} isDark={true} active={this.props.current}/>
                    </div>
                    <section className={"lectures-menu__section lectures-menu-nav js-lectures-menu-nav"}>
                        <button className={"lectures-menu-nav__trigger" + (this.state.showNavigationButtons ? ' opened' : '')} onClick={::this._switchNavigation}>Меню</button>
                        <div className={"lectures-menu-nav__list" + (this.state.showNavigationButtons ? ' show' : '')}>
                            <ul className="menu-nav-list">
                                {
                                    this._hasToc() ?
                                        <li className={"menu-nav-list__item" + (this.state.showToc ? ' expanded' : '')}
                                            onClick={::this._switchToc}>
                                            <div className="menu-nav-list__item-head" id='Content'>Оглавление</div>
                                            <TableOfContents episodes={this.props.episodes}/>
                                        </li>
                                        :
                                        <li className={"menu-nav-list__item"} style={_style}>
                                            <div className="menu-nav-list__item-head"  onClick={::this._scrollToTop}>В начало</div>
                                        </li>
                                }
                                {
                                    !isNeedHideRefs ?
                                        <li className="menu-nav-list__item">
                                            <a href="#recommend"
                                               className="menu-nav-list__item-head js-scroll-link">Источники</a>
                                        </li>
                                        :
                                        null
                                }
                                {
                                    !isNeedHideGallery ?
                                        <li className="menu-nav-list__item">
                                            <a href="#pictures"
                                               className="menu-nav-list__item-head js-scroll-link">Галерея</a>
                                        </li>
                                        :
                                        null
                                }

                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        )
    }
}

class TableOfContents extends React.Component {

    _mountScroll() {
        let _links = $('.js-scroll-link');
        _links.prop('onclick', null).off('click');

        _links.on("click", function (e) {
            let $target = $($(this).attr('href')),
                targetOffset = $target.offset().top;

            // let _currentPosition = $(window).scrollTop(),
            //     _delta = 0;

            // if (_currentPosition > targetOffset) {
            //     _delta = ($(window).outerWidth() > 899) ? 240 : 190
            // } else {
            //     _delta = 75
            // }

            let _delta = ($(window).outerWidth() > 899) ? 160 : 125

            targetOffset -= _delta;

            if ($target.length) {
                $('html, body').scrollTop(targetOffset)

                // e.preventDefault();

                // trigger scroll
                // $('html, body').animate({
                //     scrollTop: targetOffset
                // }, 0);
            }
        })
    }

    componentDidMount() {
        this._mountScroll()
    }

    componentDidUpdate() {
        this._mountScroll()
    }

    componentWillUnmount() {
        let _links = $('.js-scroll-link');
        _links.prop('onclick', null).off('click');
    }

    _getList() {
        if (!this.props.episodes) {
            return
        }

        return this.props.episodes.map((episode) => {
            return episode.Toc.map((item) => {
                const _id = 'toc' + item.Id;
                return <li className="menu-nav-sublist__item current" key={_id}>
                    <a href={"#" + _id} className="menu-nav-sublist__link js-scroll-link">{item.Topic}</a>
                </li>
            })
        })
    }

    render() {
        return (
            <ol className="menu-nav-sublist" style={{top: 43}}>
                {this._getList()}
            </ol>
        )
    }
}

function mapStateToProps(state) {
    return {
        isLessonMenuOpened: state.app.isLessonMenuOpened,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);