import React, {Component} from 'react';

export default class CourseModuleHeader extends Component {

    _getTitleClassName() {
        let _name = 'course-module__title';
        this.props.size.forEach((size) => {
            _name = _name + ' title-' + size
        });

        return _name;
    }

    render() {
        let {title} = this.props;

        return (

            <h1 className={this._getTitleClassName()}>
                <p className="course-module__label">Курс:</p>
                {title}
            </h1>
        );
    }
}