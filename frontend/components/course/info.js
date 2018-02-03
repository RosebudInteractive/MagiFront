import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class Info extends Component {

    _getClassName(mainName, added) {
        let _name = mainName;
        this.props.size.forEach((size) => {
            _name = _name + ' ' + added + '-' + size
        });

        return _name;
    }

    render() {
        let _course = this.props.courses[this.props.courseIndex];

        const _name = _course.AuthorsObj[0].FirstName + ' ' + _course.AuthorsObj[0].LastName;
        // const _surname = _course.Authors[0].LastName;
        const _category = _course.CategoriesObj[0].Name;

        return (
            <div className={this._getClassName("course-module__info", 'info')}>
                <div className={this._getClassName('course-module__info-col', 'info-col')}>
                    <p className={this._getClassName('course-module__info-col-header', 'info-col-header')}>Лектор</p>
                    <p className={this._getClassName('course-module__info-col-descr', 'info-col-descr')}>{_name}</p>
                    {/*<p className={this._getClassName('course-module__info-col-descr', 'info-col-descr')}>{_surname}</p>*/}
                </div>
                <div className={this._getClassName('course-module__info-col', 'info-col')}>
                    <p className={this._getClassName('course-module__info-col-header', 'info-col-header')}>Категория</p>
                    <p className={this._getClassName('course-module__info-col-descr', 'info-col-descr')}>{_category}</p>
                </div>
            </div>
        );
    }
}

Info.propTypes = {
    courseIndex: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
    return {
        courses: state.courses.items,
    }
}

export default connect(mapStateToProps)(Info)