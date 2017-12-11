import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as courseActions from '../actions/SingleCourseActions';

class CourseCategories extends Component {
    addClicked() {
        this.props.addCategoryAction();
    }

    removeCategoryFormCourse(id) {
        this.props.courseActions.removeCategory(id)
    }

    render () {
        const {data} = this.props;
        return <div>
            Категории курса
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
            width: 600,
            select: true,
            editable: false,
            columns: [
                {id: 'Name', header: 'Имя', fillspace: true,}, //fillspace: true},
                {
                    id: "",
                    template: "<input class='delbtn' type='button' value='Delete'>",
                    // css:"padding_less",
                    width: 100
                },
            ],

            onClick: {
                delbtn: (e, id) => {
                    //will be called on button click
                    this.removeCategoryFormCourse(id.row);
                }
            }
        };
    }
}

CourseCategories.propTypes = {
    // message: PropTypes.string.isRequired,
    addCategoryAction: PropTypes.func.isRequired,
    // noAction: PropTypes.func.isRequired,
    data: PropTypes.any
};

function mapDispatchToProps(dispatch) {
    return {
        courseActions : bindActionCreators(courseActions, dispatch),
    }
}
//
export default connect(null, mapDispatchToProps)(CourseCategories);
