import React from 'react'
import {Field,} from 'redux-form'
import Select from "../../common/select-control";
import TextArea from "../../common/text-area";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import BookAuthorsGrid from "../author-grid";

class AuthorsTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _authors = window.$$('book-authors'),
                _width = $('.modal-editor').width() - 17

            if (_authors) {
                _authors.$setSize(_width, _authors.height);
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
            <Field component={BookAuthorsGrid} name="authors"/>
            <Field component={TextArea} name="otherAuthors" label="Другие авторы" enableHtml={false}/>
            <Field component={TextArea} name="otherCommentAuthors" label="Другие автор комментария" enableHtml={false}/>
            <Field component={Select} name="course" label="Курс" placeholder="Выберите курс" options={this._getCourses()}/>
        </div>
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
            // if(a.value < b.value) { return -1; }
            // if(a.value > b.value) { return 1; }
            return a.value.localeCompare(b.value);
        })

        return _options
    }
}

function mapStateToProps(state) {
    return {
        courses: state.courses.items,
    }
}

export default connect(mapStateToProps,)(AuthorsTab);