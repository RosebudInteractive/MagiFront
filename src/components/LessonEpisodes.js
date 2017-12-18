import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';

export default class LessonEpisodes extends Component {
    constructor(props) {
        super(props);

        this.selected = null;
    }

    create(){
        this.props.createAction();
    }

    add() {
        // this.props.addAuthorAction();
    }

    edit() {
        if (this.selected) {
            this.props.editAction(this.selected);
        }
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

    _hasSelected() {
        return this.selected !== null
    }

    render () {
        const {message, data} = this.props;
        return <div>
            {message}
            <div className="dlg-btn-bar">
                <button className="btn-new" onClick={::this.create}/>{' '}
                {/*<button className="btn-add" onClick={::this.add}/>{' '}*/}
                <button className='btn-edit' onClick={::this.edit}/>{' '}
                <button className="btn-up" onClick={::this.moveUp}/>{' '}
                <button className="btn-down" onClick={::this.moveDown}/>{' '}
            </div>
            <Webix ui={::this.getUI(this.selected)} data={data}/>
        </div>
    }

    getUI(selected) {
        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            width: 700,
            editable: false,
            columns: [
                {id: 'Number', header: '#', width: 30},
                {id: 'Name', header: 'Название', fillspace: true},
                {id: 'State', header: 'Состояние', width: 90, editor: 'select',
                    options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]},
                {id: 'LanguageName', header: 'Язык курса', width: 90},
                {
                    id: "",
                    template: "<input class='delbtn' type='button'>",
                    width: 50
                },
            ],

            on: {
                onAfterSelect: (selObj) => {
                    this.select(selObj.id);
                },
                onAfterRender: function() {
                    if ((selected) && this.getItem(selected)) {
                        this.select(selected)
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

LessonEpisodes.propTypes = {
    message: PropTypes.string.isRequired,
    createAction: PropTypes.func.isRequired,
    editAction: PropTypes.func.isRequired,
    removeAction: PropTypes.func.isRequired,
    moveUpAction: PropTypes.func.isRequired,
    moveDownAction: PropTypes.func.isRequired,
    data: PropTypes.any
};