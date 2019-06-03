import React from 'react'
import GridControl from "../../gridControl";
import PropTypes from "prop-types";
import PromoProductDialog from "./product-dialog";
import {connect} from "react-redux";
import {productsSelector} from "adm-ducks/products";

export class ProductsGrid extends GridControl {

    constructor(props) {
        super(props)
    }

    static propTypes = {
        onDataUpdate: PropTypes.func,
    }

    _getId() {
        return 'promo-products';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Code', header: 'Код продкута', width: 100},
            {id: 'Name', header: 'Название', fillspace: true},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

class PromoProductsGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            showDialog: false
        }
    }

    render() {
        let _promoProducts = this._getPromoProducts()

        return <div className="promo-products">
            <ProductsGrid addAction={::this._showProductsLookup}
                          removeAction={::this._remove}
                          editMode={this.props.editMode}
                          data={_promoProducts}/>
            {
                this.state.showDialog
                    ?
                    <PromoProductDialog
                        products={this.props.products}
                        promoProducts={this.props.input.value}
                        cancel={::this._hideProductsLookup}
                        accept={::this._add}/>
                    :
                    null
            }
        </div>

    }

    _showProductsLookup() {
        this.setState({showDialog: true})
    }

    _hideProductsLookup() {
        this.setState({showDialog: false})
    }

    _add(productId) {
        this.setState({showDialog: false})

        let _array = [...this.props.input.value]
        _array.push(productId)

        this.props.input.onChange(_array)
    }

    _remove(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item === +id
            })

        if (_index >= 0) {
            _array.splice(_index, 1)
        }

        this.props.input.onChange(_array)
    }

    _getPromoProducts() {
        const {
            products,
            input
        } = this.props;

        let _promoProducts = [];

        if (input.value) {
            input.value.map((item, index) => {
                let _product = products.find((product) => {
                    return product.id === item
                });

                if (_product) {
                    let _item = Object.assign({}, _product)
                    _item.Number = index + 1

                    _promoProducts.push(_item);
                }
            });
        }

        return _promoProducts;
    }
}

function mapStateToProps(state) {
    return {
        products: productsSelector(state),
    }
}

export default connect(mapStateToProps)(PromoProductsGrid);