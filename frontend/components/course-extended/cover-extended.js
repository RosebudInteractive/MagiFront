import React from 'react';
import {connect} from 'react-redux';

import Info from '../course/course-module-info';

// import CourseBody from './body';

class Cover extends React.Component {

    render() {
        if (!this.props.course) {
            return null
        }

        let _authors = this.props.course.Authors ? this.props.course.Authors : [];
        let _categories = this.props.course.Categories ? this.props.course.Categories : [];
        let _cover = this.props.course.Cover ? '/data/' + this.props.course.Cover : null;

        return (
            <div className="course-module__info-block">
                <Header
                    authors={_authors}
                    categories={_categories}
                    cover={_cover}
                />
            </div>
        );
    }
}

class Header extends React.Component {
    render() {
        return (
            <div className="course-module__header">
                <Info authors={this.props.authors} categories={this.props.categories} showPhoto={true}/>
                <Body cover={this.props.cover}/>
            </div>
        )
    }
}

class Body extends React.Component {
    render() {
        return (
            <div className="course-module__body">
                <div className="course-module__image-block">
                    <div width="560" height="628" className="course-module__masked-image">
                        <img src={this.props.cover} width="560" height="372"/>

                        {/*<symbol id="s-mask-circles">*/}
                            {/*<g stroke="gray" strokeWidth={12} fill="white">*/}
                                {/*<circle cx="33%" cy="20%" r="20%"/>*/}
                                {/*<circle cx="72%" cy="33%" r="25%"/>*/}
                            {/*</g>*/}
                        {/*</symbol>*/}

                        {/*<mask id="svgmask01">*/}
                            {/*/!*<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#s-mask-circles"></use>*!/*/}
                        {/*</mask>*/}

                        {/*<g mask="url(#svgmask01)">*/}
                            {/*<image xlinkHref={this.props.cover} width="560" height="372"/>*/}
                        {/*</g>*/}
                    </div>
                    {/**/}
                </div>
            </div>
        )
    }
}

// {/*<svg width="560" height="628" className="course-module__masked-image">*/}
// {/*<symbol id="s-mask-circles">*/}
// {/*<g stroke="gray" strokeWidth="12" fill="white">*/}
// {/*<circle cx="33%" cy="20%" r="20%"/>*/}
// {/*<circle cx="72%" cy="33%" r="25%"/>*/}
// {/*</g>*/}
// {/*</symbol>*/}
// {/*<mask id="svgmask01">*/}
// {/*<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#s-mask-circles"></use>*/}
// {/*</mask>*/}
// {/*<g mask="url(#svgmask01)">*/}
// {/*<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="assets/images/bg-frame01.png" width="560" height="372"></image>*/}
// {/*</g>*/}
// {/*</svg>*/}

function mapStateToProps(state) {
    return {
        course: state.singleCourse.object,
    }
}

export default connect(mapStateToProps)(Cover);