import React from 'react'
import CommonRefsGrid from '../grids/common-refs'
import RecommendedRefsGrid from '../grids/recommended-refs'
import PropTypes from 'prop-types'

export default class ReferencesTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _commonRefs = window.$$('common-refs'),
                _recommendedRefs = window.$$('recommended-refs'),
                _width = $('.editor__main-area').width() - 20

            if (_commonRefs) {
                _commonRefs.$setSize(_width, _commonRefs.height);
            }

            if (_recommendedRefs) {
                _recommendedRefs.$setSize(_width, _recommendedRefs.height);
            }
        }
    }

    componentDidMount(){
        $(window).bind('resize', this._resizeHandler)

        this._resizeHandler();
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        return <div className={"tab-wrapper tab-wrapper__authors-and-categories" + (this.props.visible ? '' : ' hidden')}>
            <CommonRefsGrid editMode={this.props.editMode}/>
            <RecommendedRefsGrid editMode={this.props.editMode}/>
        </div>
    }
}

