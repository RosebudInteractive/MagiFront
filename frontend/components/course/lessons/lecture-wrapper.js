import React from 'react';
import PropTypes from 'prop-types';
import SingleLecture from './single-lecture'
import LecturesList from './lectures-list'

export default class Wrapper extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string.isRequired,
        lessons: PropTypes.array.isRequired,
        isMobile: PropTypes.bool.isRequired,
    };

    render() {
        let {lessons, isMobile} = this.props;

        return (
            <div className='lectures-wrapper'>
                {
                    isMobile ?
                        <LecturesList lessons={lessons} courseUrl={this.props.courseUrl}/>
                        :
                        <SingleLecture lesson={lessons[0]} courseUrl={this.props.courseUrl}/>
                }
            </div>
        )
    }
}