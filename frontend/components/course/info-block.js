import React from 'react';
import Header from './header';
import Info from './info';
import CourseBody from './body';

export default class InfoBlock extends React.Component {

    _getClassName() {
        let _name = 'course-module__info-block';
        this.props.size.forEach((size) => {
            _name = _name + ' info-block-' + size
        });

        return _name;
    }


    render() {
        const {size, title, width} = this.props;
        return (
            <div className={this._getClassName()}>
                <div className="course-module__header">
                    <Header size={size} title={title}/>
                    <Info size={size}/>
                </div>
                <CourseBody size={size} width={width}/>
            </div>
        );
    }
}