import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';

export default class LessonEpisodes extends Component {
    constructor(props) {
        super(props);

        this.selected = null;
    }

    create(){

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
        return this.select !== null
    }

    render () {
        const {message, data} = this.props;
        return <div>
            {message}
            <div className="dlg-btn-bar">
                <button className="btn yes" onClick={::this.create}>Создать...</button>{' '}
                <button className="btn yes" onClick={::this.add}>Добавить...</button>{' '}
                <button
                    className={'btn' + (::this._hasSelected() ? " disabled" : "")}
                    onClick={::this.edit}
                    disabled={::this._hasSelected()}
                >Исправить...
                </button>{' '}
                <button className="btn yes" onClick={::this.moveUp}>Вверх</button>{' '}
                <button className="btn yes" onClick={::this.moveDown}>Вниз</button>{' '}
            </div>
            <Webix ui={::this.getUI(::this.select)} data={data}/>
        </div>
    }

    getUI() {
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
                    template: "<input class='delbtn' type='button' value='Delete'>",
                    width: 80
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

LessonEpisodes.propTypes = {
    message: PropTypes.string.isRequired,
    createAction: PropTypes.func.isRequired,
    editAction: PropTypes.func.isRequired,
    removeAction: PropTypes.func.isRequired,
    moveUpAction: PropTypes.func.isRequired,
    moveDownAction: PropTypes.func.isRequired,
    data: PropTypes.any
};