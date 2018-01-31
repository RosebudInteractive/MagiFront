import BaseComponent from '../base-component';
import React from 'react';
import {Counter, Wrapper} from './lecture';

export default class LectureBlock extends BaseComponent {

    render() {
        let {size, width} = this.props;
        return (
            <div className={this._getClassName("course-module__body", 'course-body')}>
                <Counter size={size} current={10} total={13}/>
                <Wrapper size={size} width={width}/>
            </div>
        );
    }
}