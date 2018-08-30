import React, {Component} from 'react';
import $ from 'jquery'

export default class SizeInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            innerWidth: $(window).innerWidth(),
            innerHeight: $(window).innerHeight(),
            outerWidth: $(window).outerWidth(),
            outerHeight: $(window).outerHeight()
        }

        this._resizeHandler = () => {
            this.setState({
                innerWidth: $(window).innerWidth(),
                innerHeight: $(window).innerHeight(),
                outerWidth: $(window).outerWidth(),
                outerHeight: $(window).outerHeight()
            })
        }
    }

    componentDidMount() {
        $(window).resize(this._resizeHandler)
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler);
    }

    render() {
        let _innerRate = this.state.innerWidth / this.state.innerHeight,
            _outerRate = this.state.outerWidth / this.state.outerHeight,
            _inner = 'inner : ' + this.state.innerWidth + ' / ' + this.state.innerHeight + ' K = ' + Math.round(_innerRate * 100) / 100,
            _outer = 'outer : ' + this.state.outerWidth + ' / ' + this.state.outerHeight + ' K = ' + Math.round(_outerRate * 100) / 100;

        return (
            <div className='size-info'>
                <p>
                    <span>{_inner}</span>
                </p>
                <p>
                    <span>{_outer}</span>
                </p>
            </div>
        )
    }
}