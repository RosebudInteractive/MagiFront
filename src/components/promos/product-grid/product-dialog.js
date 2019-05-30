import React from 'react'
import LookupDialog from "../../LookupDialog";
import PropTypes from "prop-types";

export default class PromoProductDialog extends React.Component {

    static propTypes = {
        promoProducts: PropTypes.array,
        products: PropTypes.array,
        accept: PropTypes.func,
        cancel: PropTypes.func,
    }

    render() {
        return <LookupDialog message='Курсы' data={::this._getProductList()}
                          yesAction={::this._yes}
                          noAction={::this._no}/>

    }

    _getProductList() {
        const {
            products,
            promoProducts
        } = this.props;

        if (!promoProducts) return

        let _filtered = products.filter((value) => {
            return !promoProducts.find((item) => {
                return item === value.id
            });
        });

        return _filtered.map((element) => {
            return {id: element.id, value: element.Name}
        })
    }

    _yes(data) {
        if (this.props.accept) {
            this.props.accept(data)
        }
    }

    _no() {
        if (this.props.cancel) {
            this.props.cancel()
        }
    }
}