import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import LessonsListWrapper from './lessons-list-wrapper';

export default class Menu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            opened: false
        }
    }

    static propTypes = {
        courseTitle: PropTypes.string.isRequired,
        courseUrl: PropTypes.string.isRequired,
        current: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
    };

    componentDidUnmount() {
        console.log('will unmount')
    }

    _switchMenu() {
        this.setState({opened: !this.state.opened})
    }


    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>';
        // _share = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share"/>';


        return (
            <div className={"lectures-menu js-lectures-menu _dark" + (this.state.opened ? ' opened' : '')}>
                <div className="lectures-menu__section">
                    <Link to={'/'} className="logo-min">
                        <svg width="75" height="40" dangerouslySetInnerHTML={{__html: _logoMob}}/>
                    </Link>
                    <a href={'/category/' + this.props.courseUrl} className="lectures-menu__link-back">
                        <div className="icon">
                            <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _linkBack}}/>
                        </div>
                        <span><span className="label">Курс:</span>{' ' + this.props.courseTitle}</span>
                    </a>
                </div>
                <div className="lectures-menu__section lectures-list-block">
                    <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                            onClick={::this._switchMenu}><span>Лекция </span>
                        <span className="num"><span
                            className="current">{this.props.current}</span>{'/' + this.props.total}</span></button>
                    <LessonsListWrapper {...this.props}/>
                </div>

            </div>
        )
    }
}

{/*<button type="button" className="social-trigger">*/
}
{/*<svg width="18" height="18" dangerouslySetInnerHTML={{__html: _share}}/>*/
}
{/*</button>*/
}