
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import User from '../components/User'
import Page from '../components/Page'
import Menu from "../components/Menu"
import Episodes from "../containers/Episodes"
import * as pageActions from '../actions/PageActions'
import * as menuActions from "../actions/MenuActions"
import * as episodesActions from "../actions/EpisodesActions"
import { MENU_ITEM_OTHER } from '../constants/Menu'

class App extends Component {
    render() {
        const { user, page, menu, episodes } = this.props
        const { getPhotos } = this.props.pageActions
        const { setSelected } = this.props.menuActions
        const {
            getEpisodes,
            selectEpisode,
            deleteEpisode,
            showDeleteConfirmation,
            cancelDelete,
            showEditDialog,
            hideEditDialog,
            saveEpisode
        } = this.props.episodesActions
        return <div className="app">
            <div className="left bar-bgcolor">
                <div className="toolbar top-bar-size">
                    <div className="logo-sidebar">
                        <div>Magisteria</div>
                    </div>
                    <Menu items={menu.items} selected={menu.selected} setSelected={setSelected} getEpisodes={getEpisodes}/>
                </div>
            </div>
            <div className="right">
                <div className="right-container">
                    <div className="right-top top-bar-size">
                        <div className="toolbar top-bar-size bar-bgcolor">
                        </div>
                    </div>
                    <div className="main-area">
                        {
                            menu.selected == MENU_ITEM_OTHER ?
                                <div>
                                    <Page photos={page.photos} year={page.year} getPhotos={getPhotos} fetching={page.fetching}/>
                                    < User name={user.name} />
                                </div>
                            :
                                <div className="page">
                                    <Episodes episodes={episodes.episodes}
                                              getEpisodes={getEpisodes}
                                              fetching={episodes.fetching}
                                              hasError={episodes.hasError}
                                              selected={episodes.selected}
                                              message={episodes.message}
                                              select={selectEpisode}
                                              deleteDlgShown={episodes.deleteDlgShown}
                                              errorDlgShown={episodes.errorDlgShown}
                                              showDeleteDlg={showDeleteConfirmation}
                                              hideDeleteDlg={cancelDelete}
                                              delete={deleteEpisode}
                                              editDlgShown={episodes.editDlgShown}
                                              showEditDlg={showEditDialog}
                                              editMode={episodes.editMode}
                                              hideEditDlg={hideEditDialog}
                                              saveEpisode={saveEpisode}
                                    />
                                </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    }
}
function mapStateToProps(state) {
    return {
        user: state.user,
        page: state.page,
        menu: state.menu,
        episodes: state.episodes
    }
}
function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(pageActions, dispatch),
        menuActions: bindActionCreators(menuActions, dispatch),
        episodesActions: bindActionCreators(episodesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
