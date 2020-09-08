import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {
    createNewReview,
    deleteReview,
    editReview,
    getReviews,
    loadedSelector,
    loadingSelector,
    reviewsSelector,
    showEditorSelector,
} from "adm-ducks/reviews";
import {cancelDelete, showDeleteConfirmation} from '../../actions/CommonDlgActions';
import ReviewEditor from '../../components/reviews/editor'

import Webix from '../../components/Webix';
import ErrorDialog from '../../components/dialog/error-dialog';
import LoadingPage from "../../components/common/loading-page";
import PropTypes from "prop-types";
import $ from "jquery";
import {
    resizeHandler,
    restoreGridPosition,
    saveGridScrollPos,
    selectGridItem,
    selectItemWithNoRefresh
} from "../../tools/grid-common-functions";
import {coursesSelector} from "adm-ducks/course";

class ReviewsPage extends React.Component {

    static propTypes = {
        showEditor: PropTypes.bool,
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._isFirstSelected = false;
        this._isLastSelected = false;

        this._resizeHandler = resizeHandler.bind(this)
        this._restoreGridPosition = restoreGridPosition.bind(this)
        this._saveScrollPos = saveGridScrollPos.bind(this)
        this._select = selectGridItem.bind(this)
        this._selectNoRefresh = selectItemWithNoRefresh.bind(this)
    }

    get tableId() {
        return "reviews-grid"
    }

    UNSAFE_componentWillMount() {
        if (this.props.showEditor) {
            if (this.props.editMode) {
                this.props.editReview(this.props.reviewId)
            } else {
                this.props.createNewReview();
            }
        }

        this.props.getReviews();
        this._selected = null;
    }

    componentDidMount() {
        $(window).on('resize', this._resizeHandler);
        this._resizeHandler();
    }

    UNSAFE_componentWillReceiveProps(nextProps,) {
        if (!this.props.loaded && nextProps.loaded) {

            this._selected = (nextProps.reviews.length > 0) ?
                nextProps.reviewId ?
                    nextProps.reviewId
                    :
                    nextProps.reviews[0].id
                :
                null;

            this._isFirstSelected = !!this._selected
        }

        this._saveScrollPos()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.loading && !this.props.loading) {
            this._resizeHandler();
        }

        this._restoreGridPosition()
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        const {
            loading,
            loaded,
            showReviewEditor,
        } = this.props;

        return !loading && loaded ?
            <div className="reviews">
                <div className="reviews-content">
                    <div className="action-bar">
                        <button className='tool-btn new' onClick={::this.props.createNewReview}/>
                        <button
                            className={'tool-btn edit' + (this._selected === null ? " disabled" : "")}
                            onClick={::this._onEditBtnClick}
                            disabled={(this._selected === null)}
                        />
                        <button
                            className={'tool-btn delete' + (this._selected === null ? " disabled" : "")}
                            onClick={::this._onDeleteReview}
                            disabled={(this._selected === null)}
                        />
                    </div>
                    <div className="grid-container">
                        <div className="webix-grid-wrapper">
                            <Webix ui={::this.getUI(::this._select)} data={this._getData()}/>
                        </div>
                    </div>
                </div>
                { !showReviewEditor ? <ErrorDialog/> : null }
                <ReviewEditor onPrevClick={this._isFirstSelected ? null : ::this._onEditPrev}
                             onNextClick={this._isLastSelected ? null : ::this._onEditNext}/>
            </div>
            :
            <LoadingPage/>
    }

    _onEditBtnClick() {
        this.props.editReview(this._selected);
    }

    _onDeleteReview() {
        if (this._selected) {
            const _review = this.props.reviews.find((item) => {
                return item.id === this._selected
            })

            this.props.deleteReview(_review)
        }

    }

    _onEditPrev() {
        const _index = this.props.reviews.findIndex((item) => {
            return item.id === this.props.reviewId
        })

        if (_index > 0) {
            window.$$(this.tableId).select(this.props.reviews[_index - 1].id)
        }

        this._onEditBtnClick()
    }

    _onEditNext() {
        const _index = this.props.reviews.findIndex((item) => {
            return item.id === this.props.reviewId
        })

        if (_index < this.props.reviews.length - 1) {
            window.$$(this.tableId).select(this.props.reviews[_index + 1].id)
        }

        this._onEditBtnClick()
    }

    _getData() {
        return this.props.reviews.map((item) => {
            return Object.assign({}, item)
        })
    }

    _getCourses() {
        let {courses} = this.props;

        if (!courses || (courses.length < 1)) {
            return null
        }

        let _options = this.props.courses.map((course) => {
            return {id: course.id, value: course.Name}
        })


        _options.sort((a, b) =>  {
            return a.value.localeCompare(b.value);
        })

        return _options
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            id: this.tableId,
            scroll: 'y',
            height: 500,
            select: 'row',
            editable: false,
            tooltip:true,
            columns: [
                {id: 'ReviewDate', header: 'Дата', width: 150, format: this._formatDate},
                {id: 'CourseId', header: ['Курс',  {content:"selectFilter"}], width: 330, editor: 'select', options: this._getCourses()},
                {id: "UserName", header: "Пользователь", width: 150},
                {id: "Review", header: "Отзыв",  fillspace: true, adjust: "data", minColumnWidth: 200},
                {
                    id: 'Status', header: ['Состояние', {content:"selectFilter"}], width: 150, editor: 'select',
                    options: [
                        {id: '1', value: 'Опубликованный'},
                        {id: '2', value: 'На модерации'},
                        {id: '3', value: 'Архив'
                    }]
                },
            ],
            on: {
                onAfterSelect: function (selObj) {
                    if ((parseInt(selObj.id) !== that._selected) && this.getItem(selObj.id)) {
                        that._selected = null;
                        let _obj = {
                            isFirst: this.getFirstId() === selObj.id,
                            isLast: this.getLastId() === selObj.id,
                            id: +selObj.id,
                        };
                        that._select(_obj);
                    }
                },
                onAfterRender: function () {
                    if ((that._selected) && this.getItem(that._selected)) {
                        let _selectedItem = this.getSelectedItem()

                        if (!_selectedItem || (_selectedItem.Id !== that._selected)) {
                            this.select(that._selected)
                        }

                        let _obj = {
                            isFirst: this.getFirstId() === that._selected,
                            isLast: this.getLastId() === that._selected,
                            id: that._selected,
                        };

                        that._selectNoRefresh(_obj);
                    }
                },
            }
        };

    }

    _formatDate(data) {
        let fn = window.webix.Date.dateToStr("%d.%m.%Y %H:%i", false);
        return data ? fn(new Date(data)) : '';
    }
}

function mapStateToProps(state, ownProps) {
    return {
        loaded: loadedSelector(state),
        loading: loadingSelector(state),
        reviews: reviewsSelector(state),
        courses: coursesSelector(state),

        deleteDlgShown: state.commonDlg.deleteDlgShown,
        showReviewEditor: showEditorSelector(state),

        reviewId: ownProps.match ? Number(ownProps.match.params.id) : null,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ getReviews, createNewReview, editReview, deleteReview, showDeleteConfirmation, cancelDelete, }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewsPage);