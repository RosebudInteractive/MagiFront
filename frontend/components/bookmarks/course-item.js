import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {ImageSize, getCoverPath} from '../../tools/page-tools'
import PriceBlock from "../common/price-block";
import {connect} from 'react-redux';
import {userPaidCoursesSelector} from "ducks/profile";
import {getCrownForCourse} from "../../tools/svg-paths";
import {notifyCourseLinkClicked} from "ducks/google-analytics";
import {bindActionCreators} from "redux";

class Item extends React.Component {

    static propTypes = {
        item: PropTypes.object,
        isFavorite: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._onLinkClickHandler = () => {
            const {item: course} = this.props

            this.props.notifyCourseLinkClicked({
                ...course,
                author: course.authors[0].FirstName + " " + course.authors[0].LastName,
                category: course.categories[0].Name,
                price: course.IsPaid ? (course.DPrice && course.Discount ? course.DPrice : course.Price) : 0
            })
        }
    }

    componentDidMount() {
        const {item} = this.props,
            _selector = `#img-course-link${item.Id}` + ", " +
                `#btn-course-link${item.Id}` + ", " +
                `#title-course-link${item.Id}`

        $(_selector).bind("click", this._onLinkClickHandler)
    }

    componentWillUnmount() {
        const {item} = this.props,
            _selector = `#img-course-link${item.Id}` + ", " +
                `#btn-course-link${item.Id}` + ", " +
                `#title-course-link${item.Id}`

        $(_selector).unbind("click", this._onLinkClickHandler)
    }

    _favoritesClick() {
        if (this.props.onRemoveItem) {
            this.props.onRemoveItem(this.props.item)
        }
    }

    render() {
        let {item, isFavorite, userPaidCourses} = this.props,
            _coverPath = getCoverPath(item, ImageSize.medium),
            _cover = _coverPath ? '/data/' + _coverPath : null;

        let _authors = item.authors.map((author) => {
            return (<Link to={'/autor/' + author.URL}
                          className="fav-card__info-link _author">{author.FirstName + ' ' + author.LastName}</Link>);
        });

        let _categories = item.categories.map((category) => {
            return (<div className="fav-card__info-link _tag">{category.Name}</div>);
        });

        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fav"/>',
            _image = '<image preserveAspectRatio="xMidYMid slice" xlink:href="' + _cover + '" width="563" height="514"/>';

        let _priceButtonHidden = !(item && item.IsPaid && !item.IsGift && !item.IsBought) || userPaidCourses.includes(item.Id)

        return (
            <div className="fav-card">
                <div className={"fav-card__header" + (!_priceButtonHidden ? " _with-price-button" : "")}>
                    <h3 className="fav-card__title">
                        <span className={"fav" + (isFavorite ? " active" : "")} onClick={::this._favoritesClick}>
                            <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _flag}}/>
                        </span>
                        <Link to={'/category/' + item.URL} id={`title-course-link${item.Id}`}>
                            <span className="fav-card__title-text">
                                <p className="label course-module__label">
                                    { getCrownForCourse(item) }
                                    Курс:
                                </p>
                                <span className='title'>{item.Name}</span>
                            </span>
                        </Link>
                    </h3>
                    <div className="fav-card__info">
                        {_authors}
                        {_categories}
                    </div>
                </div>
                <PriceBlock course={item}/>
                <div className="fav-card__body">
                    <div className="fav-card__col">
                        {
                            _priceButtonHidden ?
                                <Link to={'/category/' + item.URL} className="btn btn--rounded fav-card__link" id={`btn-course-link${item.Id}`}>
                                    Подробнее о курсе
                                </Link>
                                :
                                null
                        }
                    </div>
                    <div className="fav-card__col">
                        <Link to={'/category/' + item.URL} className={"fav-card__image-block " + item.Mask} id={`img-course-link${item.Id}`}>
                            <svg viewBox="0 0 563 514" width="563" height="514"
                                 dangerouslySetInnerHTML={{__html: _image}}/>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {userPaidCourses: userPaidCoursesSelector(state)}
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({notifyCourseLinkClicked}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Item);