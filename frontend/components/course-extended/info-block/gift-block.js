import React from "react"
import PropTypes from "prop-types"

export default class GiftBlock extends React.Component {

    static propTypes = {
        visible : PropTypes.bool,
    }

    render() {
        if (!this.props.visible) {
            return null
        }

        return <div className="course-module__gift-block">
            <span className="gift-block__text">
                Этот курс доступен Вам, потому что Вы зарегистрировались до того как он стал платным.
            </span>
        </div>
    }

}
