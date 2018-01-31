import React, { Component } from 'react';

export default class CourseModuleHeader extends Component {

    _getClassName(mainName, added) {
        let _name = mainName;
        this.props.size.forEach((size) => {
            _name = _name + ' ' + added + '-' + size
        });

        return _name;
    }

    render() {
        const _name = 'Олег';
        const _surname = 'Воскобойников';

        return (
            <div className={this._getClassName("course-module__info", 'info')}>
                <div className={this._getClassName('course-module__info-col', 'info-col')}>
                    <p className={this._getClassName('course-module__info-col-header', 'info-col-header')}>Лектор</p>
                    <p className={this._getClassName('course-module__info-col-descr', 'info-col-descr')}>{_name}</p>
                    <p className={this._getClassName('course-module__info-col-descr', 'info-col-descr')}>{_surname}</p>
                </div>
                <div className={this._getClassName('course-module__info-col', 'info-col')}>
                    <p className={this._getClassName('course-module__info-col-header', 'info-col-header')}>Категория</p>
                    <p className={this._getClassName('course-module__info-col-descr', 'info-col-descr')}>История</p>
                </div>
            </div>
        );
    }
}