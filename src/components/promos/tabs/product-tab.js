import React from 'react'
import {Field,} from 'redux-form'
import PropTypes from "prop-types";
// import {connect} from "react-redux";
import ProductGrid from "../product-grid";

export default class ProductTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _products = window.$$('promo-products'),
                _width = $('.modal-editor').width() - 17

            if (_products) {
                _products.$setSize(_width, _products.height);
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
        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={ProductGrid} name="products"/>
        </div>
    }
}