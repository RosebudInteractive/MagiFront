import React from 'react'
import {TabContent, TabLink, Tabs} from "react-tabs-redux";
import CourseAuthors from './course-authors'
import CourseCategories from './course-categories'
import CourseLessons from "./course-lessons";
import PropTypes from "prop-types";

export default class DetailsWrapper extends React.Component {

    static propTypes = {
        editMode : PropTypes.bool,
        courseId: PropTypes.number,
    }

    render() {
        return (
            <Tabs className="tabs tabs-1" renderActiveTabContentOnly={true} key='tab1'>
                <div className="tab-links">
                    <TabLink to="authors">Авторы</TabLink>
                    <TabLink to="categories">Категории</TabLink>
                    <TabLink to="lessons">Лекции</TabLink>
                </div>
                <div className="content">
                    <TabContent for="authors">
                        <CourseAuthors editMode={this.props.editMode}/>
                    </TabContent>
                    <TabContent for="categories">
                        <CourseCategories editMode={this.props.editMode}/>
                    </TabContent>
                    <TabContent for="lessons">
                        <CourseLessons editMode={this.props.editMode} courseId={this.props.courseId}/>
                    </TabContent>
                </div>
            </Tabs>
            )
    }
}