import React from "react";
import PropTypes from "prop-types";
import {getCoverPath, ImageSize} from "../../tools/page-tools";
import {Link} from "react-router-dom";
import {notifyCourseLinkClicked} from "ducks/google-analytics";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

const MASKS = {
    '_mask01': {width: 574, height: 503,},
    '_mask02': {width: 543, height: 511,},
    '_mask03': {width: 549, height: 549,},
    '_mask04': {width: 546, height: 492,},
    '_mask05': {width: 564, height: 515,},
    '_mask06': {width: 566, height: 507,},
    '_mask07': {width: 570, height: 569,},
    '_mask08': {width: 528, height: 551,},
    '_mask09': {width: 560, height: 529,},
    '_mask10': {width: 560, height: 479,},
    '_mask11': {width: 525, height: 495,},
    '_mask12': {width: 548, height: 507,},
}

class ImageBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    };

    constructor(props) {
        super(props)

        this.state = {
            visible: false
        }

        this._onImageLoadHandler = () => {
            this.setState({visible: true})
        }
    }

    componentDidMount() {
        $(`#cover${this.props.course.Id}`).bind("load", this._onImageLoadHandler)
    }

    componentWillUnmount() {
        $(`#cover${this.props.course.Id}`).unbind("load", this._onImageLoadHandler)
    }

    render() {
        const {course} = this.props,
            _cover = getCoverPath(course, ImageSize.medium),
            _mask = MASKS[course.Mask];

        const _image = `<image preserveAspectRatio="xMidYMid slice" ` +
            `id="cover${this.props.course.Id}"` +
            `xmlns:xlink="http://www.w3.org/1999/xlink" ` +
            `xlink:href="/data/${ _cover}" x="0" ` +
            `width="${_mask.width}" height="${_mask.height}"/>`;

        return (
            <Link to={'/category/' + course.URL} onClick={::this._onLinkClickHandler}>
                <div className={'course-module__image-block fading-cover ' + course.Mask + (this.state.visible ? ' visible' : '')}>
                    <svg viewBox={`0 0 ${_mask.width} ${_mask.height}`} width={_mask.width} height={_mask.height} dangerouslySetInnerHTML={{__html: _image}}/>
                </div>
            </Link>
        );
    }

    _onLinkClickHandler() {
        const {course} = this.props

        this.props.notifyCourseLinkClicked({
            ...course,
            author: course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName,
            category: course.CategoriesObj[0].Name,
            price: course.IsPaid ? (course.DPrice && course.Discount ? course.DPrice : course.Price) : 0
        })
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({notifyCourseLinkClicked}, dispatch)
}

export default connect(null, mapDispatchToProps)(ImageBlock)