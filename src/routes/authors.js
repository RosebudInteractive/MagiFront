import React from 'react'
import {Route,} from 'react-router-dom'
import Authors from "../containers/Authors"
import AuthorForm from '../containers/authorEditor';

export default class AuthorsRout extends React.Component{

    render() {
        return <React.Fragment>
            <Route path = "/adm/authors/new" component={AuthorForm}/>
            <Route path = "/adm/authors/edit/:id" component={AuthorForm}/>
            <Route path = "/adm/authors" component={Authors}/>
        </React.Fragment>
    }

}

