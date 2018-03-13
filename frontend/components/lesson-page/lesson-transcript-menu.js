import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'

import LessonsListWrapper from '../lesson-page/lessons-list-wrapper';

export default class Menu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            opened: false,
            showToc: false,
        }
    }

    static propTypes = {
        courseTitle: PropTypes.string.isRequired,
        courseUrl: PropTypes.string.isRequired,
        current: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
        episodes: PropTypes.array,
    };

    _switchMenu() {
        this.setState({opened: !this.state.opened})
    }

    _switchToc() {
        this.setState({showToc: !this.state.showToc})
    }


    render() {
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
                    <section className="lectures-menu__section lectures-menu-nav" style={{width: 350.109}}>
                        <button className="lectures-menu-nav__trigger">Меню</button>
                        <div className="lectures-menu-nav__list">
                            <ul className="menu-nav-list">
                                <li className={"menu-nav-list__item" + (this.state.showToc ? ' expanded' : '')}
                                    onClick={::this._switchToc}>
                                    <div className="menu-nav-list__item-head">Оглавление</div>
                                    <TableOfContents episodes={this.props.episodes}/>
                                </li>
                                <li className="menu-nav-list__item">
                                    <a href="#recommend" className="menu-nav-list__item-head js-scroll-link">Рекомендации</a>
                                </li>
                                <li className="menu-nav-list__item">
                                    <a href="#gallery" className="menu-nav-list__item-head js-scroll-link">Галерея</a>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        )
    }
}

class TableOfContents extends React.Component {

    componentDidUpdate(){
        let _links = $('.js-scroll-link');
        _links.prop('onclick',null).off('click');

        _links.on("click", function (e) {
            let $target = $($(this).attr('href')),
                targetOffset = $target.offset().top;

            if ($target.length) {
                e.preventDefault();

                // trigger scroll
                $('html, body').animate({
                    scrollTop: targetOffset
                }, 600);
            }
        })
    }

    componentWillUnmount() {
        let _links = $('.js-scroll-link');
        _links.prop('onclick',null).off('click');
    }

    _getList() {
        if (!this.props.episodes) {
            return
        }

        // return this.props.episodes.map((episode, episodeIndex) => {
        return this.props.episodes.map((episode) => {
            // return episode.Toc.map((item, index) => {
            return episode.Toc.map((item) => {
                // const _id = episodeIndex + '-' + index;
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