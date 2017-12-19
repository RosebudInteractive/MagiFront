import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';

export default class CourseAuthors extends Component {
    constructor(props){
        super(props);

        this._selected = this.props.selected;
    }

    componentWillReceiveProps(nextProps) {
        this._selected = nextProps.selected
    }

    select(id) {
        this.props.selectAction(id);
    }

    addClicked() {
        this.props.addAction();
    }

    remove(id) {
        this.props.removeAction(id);
    }

    render () {
        const {data} = this.props;
        return <div>
            Авторы курса
            <div className="dlg-btn-bar">
                <button className="btn-add" onClick={::this.addClicked}/>
            </div>
            <Webix ui={::this.getUI()} data={data}/>

        </div>
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            width: 700,
            editable: false,
            columns: [
                {id: 'FirstName', header: 'Имя', width: 100,}, //fillspace: true},
                {id: 'LastName', header: 'Фамилия', fillspace: true,},
                {
                    id: "",
                    template: "<input class='delbtn' type='button'>",
                    width: 50
                },
            ],

            on: {
                onAfterSelect: function (selObj) {
                    if (selObj.id !== that._selected)
                        that._selected = null;
                    that.select(selObj.id);
                },
                onAfterRender: function() {
                    if ((that._selected) && this.getItem(that._selected)) {
                        this.select(that._selected)
                    }
                }
            },

            onClick: {
                delbtn: (e, id) => {
                    this.remove(id.row);
                }
            }
        };
    }
}

CourseAuthors.propTypes = {
    selectAction: PropTypes.func.isRequired,
    addAction: PropTypes.func.isRequired,
    removeAction: PropTypes.func.isRequired,
    selected: PropTypes.number,
    data: PropTypes.any
};
