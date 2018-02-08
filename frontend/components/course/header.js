import React, {Component} from 'react';

export default class CourseModuleHeader extends Component {

    _getTitleClassName() {
        let _name = 'course-module__title';
        this.props.size.forEach((size) => {
            _name = _name + ' title-' + size
        });

        return _name;
    }

    _getLabelClassName() {
        let _name = 'course-module__label';
        this.props.size.forEach((size) => {
            _name = _name + ' label-' + size
        });

        return _name;
    }

    _onClick() {
        this.props.onUrlClick(this.props.url)
    }

    render() {
        let {title} = this.props;

        return (
            <h1 className={this._getTitleClassName()} onClick={::this._onClick}>
                <p className={this._getLabelClassName()}>Курс:</p>
                {title}
            </h1>
        );
    }
}