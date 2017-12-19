import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';

export default class LessonReferences extends Component {
    constructor(props) {
        super(props);

        this.selected = null;
    }

    create(){
        this.props.createAction();
    }

    remove(id) {
        this.props.removeAction(id)
    }

    moveUp(){
        if (this.selected) {
            this.props.moveUpAction(this.selected)
        }
    }

    moveDown() {
        if (this.selected) {
            this.props.moveDownAction(this.selected)
        }
    }

    select(id) {
        if (this.selected !== id) {
            this.selected = id;
        }
    }

    edit() {
        if (this.selected) {
            this.props.editAction(this.selected);
        }
    }

    render () {
        const {message, data} = this.props;
        return <div>
            {message}
            <div className="dlg-btn-bar">
                <button className="btn-new" onClick={::this.create}/>{' '}
                <button className='btn-edit' onClick={::this.edit}/>{' '}
                <button className="btn-up" onClick={::this.moveUp}/>{' '}
                <button className="btn-down" onClick={::this.moveDown}/>{' '}
            </div>
            <Webix ui={::this.getUI(::this.select)} data={data}/>
        </div>
    }

    getUI() {
        return {
            container :'MainEpisodesDiv',
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            width: 700,
            editable: false,
            columns: [
                {id: 'Number', header: '#', width: 30},
                {id: 'Description', header: 'Описание', fillspace: true},
                {id: 'URL', header: 'URL', width: 120},
                {
                    id: "",
                    template: "<input class='delbtn' type='button'>",
                    width: 50
                },
            ],

            on: {
                onAfterSelect: (selObj) => {
                    this.select(selObj.id);
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

LessonReferences.propTypes = {
    message: PropTypes.string.isRequired,
    createAction: PropTypes.func.isRequired,
    editAction: PropTypes.func.isRequired,
    removeAction: PropTypes.func.isRequired,
    moveUpAction: PropTypes.func.isRequired,
    moveDownAction: PropTypes.func.isRequired,
    data: PropTypes.any
};