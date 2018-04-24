import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Menu from './lesson-menu';
import PlayerFrame from '../player/frame'
import LessonFrame from './lesson-frame';


export default class Wrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        courseUrl: PropTypes.string.isRequired,
        isMain: PropTypes.bool,
        active: PropTypes.string.isRequired,
        isPlayer: PropTypes.bool.isRequired
    };

    static defaultProps = {
        isMain: true,
        isPlayer: false
    };

    render() {
        let {isPlayer} = this.props;

        return (
            <section className='fullpage-section lecture-wrapper'
                     style={{
                         backgroundImage: "radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")",
                         // backgroundImage: "-webkit-radial-gradient(rgba(28, 27, 23, 0) 0%, #1C1B17 100%), url(" + '/data/' + this.props.lesson.Cover + ")"
                     }}>
                <Menu {...this.props} current={this.props.lesson.Number} id={'lesson-menu-' + this.props.lesson.Id}/>
                {
                    (isPlayer && !this.props.paused) ?
                        <div className='player-wrapper'>
                            <Link to={this.props.lesson.URL + "/transcript"}
                                  className={"link-to-transcript _reduced"}>
                                Транскрипт <br/>и
                                материалы
                            </Link>
                        </div>
                        :
                        <div>
                            <Link to={this.props.lesson.URL + "/transcript"}
                                  className={"link-to-transcript"}>
                                Транскрипт <br/>и
                                материалы
                            </Link>
                        </div>
                }
                <PlayerFrame {...this.props} visible={this.props.isPlayer}/>
                <LessonFrame lesson={this.props.lesson} isMain={this.props.isMain}
                             courseUrl={this.props.courseUrl}
                             visible={!this.props.isPlayer}
                />
            </section>
        )
    }
}