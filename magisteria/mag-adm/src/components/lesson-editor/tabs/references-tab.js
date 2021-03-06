import React from 'react'
import ReferencesGrid from '../grids/references'
import PropTypes from 'prop-types'
import {Field} from "redux-form";

export default class ReferencesTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _main = $('.main-area__container'),
                _rightPadding = 20;

            if (_main) {
                const _hasScrollBar = _main.get(0).scrollHeight > _main.height()
                _rightPadding = _hasScrollBar ? 20 : 2
            }

            let _commonRefs = window.$$('common-refs'),
                _recommendedRefs = window.$$('recommended-refs'),
                _width = $('.editor__main-area').width() - _rightPadding

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

    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            this._resizeHandler();
        }
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        return <div className={"tab-wrapper tab-wrapper__authors-and-categories" + (this.props.visible ? '' : ' hidden')}>
            <Field component={ReferencesGrid} name="commonRef" editMode={this.props.editMode} viewId={'common-refs'} title={'Список литературы'} isRecommended={false}/>
            <Field component={ReferencesGrid} name="recommendedRef" editMode={this.props.editMode} viewId={'recommended-refs'} title={'Рекомендуемая литература'} isRecommended={true}/>
        </div>
    }
}

