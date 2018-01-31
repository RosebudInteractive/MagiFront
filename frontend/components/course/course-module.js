import React, { Component } from 'react';
import './course-module.css';
import InfoBlock from './info-block';
import ImageBlock from './image-block';

const size = {
    xxs: 'xxs-size',
    xs: 'xs-size',
    s: 's-size',
    m: 'm-size',
    l: 'l-size',
    xl: 'xl-size',
    xxl: 'xxl-size'
};

export default class CourseModule extends Component {

    constructor() {
        super();
        this.state = {
            width:  800,
            height: 182
        }
    }

    /**
     * Calculate & Update state of new dimensions
     */
    updateDimensions() {
        if(window.innerWidth < 500) {
            this.setState({ width: 450, height: 102 });
        } else {
            let update_width  = window.innerWidth-100;
            let update_height = Math.round(update_width/4.4);
            this.setState({ width: update_width, height: update_height });
        }
    }

    /**
     * Add event listener
     */
    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    _getSize() {
        let _width = this.state.width;
        let _array = [];

        if (_width < 1900) _array.push(size.xxl);
        if (_width < 1400) _array.push(size.xl);
        if (_width < 1280) _array.push(size.l);
        if (_width < 1024) _array.push(size.m);
        if (_width < 900) _array.push(size.s);
        if (_width < 768) _array.push(size.xs);
        if (_width < 640) _array.push(size.xxs);

        return _array;
    }

    _getCourseModuleClassName() {
        let _name = 'course-module';
        this._getSize().forEach((size) => {
            _name = _name + ' module-' + size
        });

        return _name;
    }

    render() {
        return (
            <main className="courses">
                <div className={this._getCourseModuleClassName()}>
                    <InfoBlock size={this._getSize()}
                               title={' Ассирия – первый опыт создания «мировой империи» и его провал'}
                               width={this.state.width}
                    />
                    <ImageBlock size={this._getSize()}/>
                </div>
            </main>
        );
    }
}