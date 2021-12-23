import React from 'react';
import PropTypes from 'prop-types';
import SingleLecture from './single-lecture'
import LecturesList from './lectures-list'

export default class Wrapper extends React.Component {

    static propTypes = {
        lessons: PropTypes.array.isRequired,
        course: PropTypes.object,
        isMobile: PropTypes.bool.isRequired,
        isAdmin: PropTypes.bool,
    };

    render() {
        let {lessons, course, isMobile, isAdmin,} = this.props;

        return (
            <div className='lectures-wrapper'>
                {
                    isMobile ?
                        <LecturesList lessons={lessons} course={course} isAdmin={isAdmin}/>
                        :
                        <SingleLecture lesson={lessons[0]} course={course} isAdmin={isAdmin}/>
                }
            </div>
        )
    }
}