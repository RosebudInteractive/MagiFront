import React from "react";
import PropTypes from 'prop-types';

export default class Body extends React.Component {

    static propTypes = {
        cover: PropTypes.string,
        mask: PropTypes.string,
    }

    render() {
        let {cover, mask} = this.props;

        const _image = '<image preserveAspectRatio="xMidYMid slice" xlink:href="' +  cover + '" width="574" height="503"/>';

        return (
            <div className="course-module__body">
                <div className={"course-module__image-block " + mask}>
                    <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                </div>
            </div>
        )
    }
}