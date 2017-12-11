import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as courseActions from '../actions/SingleCourseActions';

class CourseAuthors extends Component {
    addClicked() {
        this.props.addAuthorAction();
    }

    removeAuthorFormCourse(id) {
        let _id = this.props.data[id-1].id;
        this.props.courseActions.removeAuthor(_id)
    }

    render () {
        const {data} = this.props;
        return <div>
            Авторы курса
            <div className="dlg-btn-bar">
                <button className="btn yes" onClick={::this.addClicked}>Добавить...</button>
            </div>
            <Webix ui={::this.getUI()} data={data}/>

        </div>
    }

    getUI() {
        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                {id: 'FirstName', header: 'Имя', width : 100, }, //fillspace: true},
                {id: 'LastName', header: 'Фамилия', width : 200, },
                { 	id:"",
                    template:"<input class='delbtn' type='button' value='Delete'>",
                    // css:"padding_less",
                    width:100 },
            ],

            onClick:{
                delbtn:(e, id) => {
                    //will be called on button click
                    this.removeAuthorFormCourse(id.row);
                }
            }
        };
    }
}

CourseAuthors.propTypes = {
    // message: PropTypes.string.isRequired,
    addAuthorAction: PropTypes.func.isRequired,
    // noAction: PropTypes.func.isRequired,
    data: PropTypes.any
}

function mapStateToProps(state) {
    return {
        courseAuthors : state.singleCourse.authors,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseActions : bindActionCreators(courseActions, dispatch),
    }
}
//
export default connect(mapStateToProps, mapDispatchToProps)(CourseAuthors);
