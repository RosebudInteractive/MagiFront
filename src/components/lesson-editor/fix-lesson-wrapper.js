import React from 'react'
import PropTypes from 'prop-types';
import FixControl from '../common/fix-course-lesson'

export default class Wrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
    }

    render() {
        return <div className="fix-course-wrapper">
            <FixControl label={'Зафиксировать лекцию'} fixed={true}/>
        </div>
    }
}
