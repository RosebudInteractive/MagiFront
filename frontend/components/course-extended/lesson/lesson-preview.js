import React from "react";

export default class LessonPreview extends React.Component {
    render() {
        return (
            <li className="lecture-full lecture-full--archive">
                <div className="lecture-full__wrapper">
                    <h3 className="lecture-full__archive-title"><a href="#">{this.props.title + ' '}</a></h3>
                    <div className="lecture-full__archive-date">{this.props.readyDate}</div>
                </div>
            </li>
        )
    }
}