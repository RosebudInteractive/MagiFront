import React from 'react'
import PropTypes from 'prop-types'
import './more-courses.sass'
import Item from './item'
import $ from "jquery";

export default class MoreCourses extends React.Component {
    static propTypes = {
        courses: PropTypes.array
    }

    constructor(props) {
        super(props)

        this._handleScroll = function() {
            _setCoverSize()
        }.bind(this)

        this._addEventListeners();
    }

    componentDidMount() {
        this._handleScroll();
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    _addEventListeners() {
        $(window).bind('resize', this._handleScroll)
    }

    _removeEventListeners() {
        $(window).unbind('resize', this._handleScroll)
    }

    render() {
        return this.props.courses && this.props.courses.length > 0 ?
            <React.Fragment>
                <div className="block-title more-courses__title">Еще курсы </div>
                <div className="more-courses__list">
                    {this._getCoursesBlocks()}
                </div>
            </React.Fragment>
            :
            null
    }

    _getCoursesBlocks(){
        return this.props.courses.map((item) => {
            return <Item course={item}/>
        })
    }
}

function _setCoverSize(){
    const _cover = $('.more-item__cover'),
         _height = _cover.width() / 1.78

    _cover.height(_height)
}