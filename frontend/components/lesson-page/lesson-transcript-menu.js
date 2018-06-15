import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'

import LessonsListWrapper from '../lesson-page/lessons-list-wrapper';

export default class Menu extends React.Component {

    constructor(props) {
        super(props);

        this._isMobileWidth = !($(window).width() > 899);
        this._scrollMounted = false;

        this.state = {
            opened: false,
            showToc: this._isMobileWidth,
            showNavigationButtons: false,
        }
    }

    static propTypes = {
        courseTitle: PropTypes.string,
        courseUrl: PropTypes.string,
        current: PropTypes.string,
        total: PropTypes.number,
        episodes: PropTypes.array,
        isNeedHideGallery: PropTypes.bool,
    };

    componentDidMount() {
        // this._mountCustomScroll()
    }

    componentWillUnmount() {
        // this._unmountCustomScroll();
    }

    _mountCustomScroll() {
        let _div = $('.lectures-menu-nav__list');
        if (_div.length && _div[0].childElementCount) {
            _div.mCustomScrollbar();
            this._scrollMounted = true;
        }
    }

    _unmountCustomScroll() {
        if (this._scrollMounted) {
            let _div = $('.lectures-menu-nav__list');
            if (_div.length) {
                _div.mCustomScrollbar('destroy');
                this._scrollMounted = false
            }
        }
    }


    _switchMenu() {
        this.setState({opened: !this.state.opened})
    }

    _switchToc() {
        this.setState({showToc: !this.state.showToc || this._isMobileWidth})
    }

    _switchNavigation() {
        this.setState({showNavigationButtons: !this.state.showNavigationButtons})
    }
    //

    componentWillReceiveProps() {
        let _newWidthIsDesktop = $(window).width() > 899;

        if (this._isMobileWidth) {
            if (_newWidthIsDesktop) {
                this._isMobileWidth = false;
                if (this.state.showToc) {
                    this.setState({showToc: false})
                }
            }
        } else {
            if (!_newWidthIsDesktop) {
                this._isMobileWidth = true;
                if (this.state.showToc) {
                    this.setState({showToc: true})
                }
            }
        }
    }

    componentDidUpdate() {
        if (!this._isMobileWidth) {
            $('.js-lectures-menu-nav').css('width', $('.lectures-menu-nav__list').width());
        } else {
            $('.js-lectures-menu-nav').css('width', '');
        }
    }

    render() {
        let {isNeedHideGallery} = this.props;

        const _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>'

        return (
            <div className="page-header__row lectures-menu-row">
                <div className={"lectures-menu" + (this.state.opened ? ' opened' : '')}>
                    <div className="lectures-menu__section">
                        <Link to={'/category/' + this.props.courseUrl} className="lectures-menu__link-back">
                            <div className="icon">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _linkBack}}/>
                            </div>
                            <span><span className="label">Курс:</span>{' ' + this.props.courseTitle}</span>
                        </Link>
                    </div>
                    <div className="lectures-menu__section lectures-list-block">
                        <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                                onClick={::this._switchMenu}><span>Лекция </span>
                            <span className="num"><span
                                className="current">{this.props.current}</span>{'/' + this.props.total}</span></button>
                        <LessonsListWrapper {...this.props} isDark={true} active={this.props.current}/>
                    </div>
                    <section className={"lectures-menu__section lectures-menu-nav js-lectures-menu-nav"}>
                        <button className="lectures-menu-nav__trigger" onClick={::this._switchNavigation}>Меню</button>
                        <div className={"lectures-menu-nav__list" + (this.state.showNavigationButtons ? ' show' : '')}>
                            <ul className="menu-nav-list">
                                <li className={"menu-nav-list__item" + (this.state.showToc ? ' expanded' : '')}
                                    onClick={::this._switchToc}>
                                    {
                                        (this.props.episodes && this.props.episodes.length > 0) ?
                                            [
                                                <div className="menu-nav-list__item-head">Оглавление</div>,
                                                <TableOfContents episodes={this.props.episodes}/>
                                            ]
                                            :
                                            null
                                    }

                                </li>
                                <li className="menu-nav-list__item">
                                    <a href="#recommend"
                                       className="menu-nav-list__item-head js-scroll-link">Источники</a>
                                </li>
                                {
                                    !isNeedHideGallery ?
                                        <li className="menu-nav-list__item">
                                            <a href="#gallery"
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

    componentDidUpdate() {
        let _links = $('.js-scroll-link');
        _links.prop('onclick', null).off('click');

        _links.on("click", function (e) {
            let $target = $($(this).attr('href')),
                targetOffset = $target.offset().top;

            let _currentPosition = $(window).scrollTop(),
                _delta = 0;

            if (_currentPosition > targetOffset) {
                _delta = 175
            } else {
                _delta = 75
            }

            targetOffset -= _delta;

            if ($target.length) {
                e.preventDefault();

                // trigger scroll
                $('html, body').animate({
                    scrollTop: targetOffset
                }, 300);
            }
        })
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
            <ol className="menu-nav-sublist" style={{top: 44}}>
                {this._getList()}
            </ol>
        )
    }
}