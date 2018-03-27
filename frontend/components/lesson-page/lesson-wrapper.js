import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Menu from './lesson-menu';
import PlayerFrame from '../player/frame'
import LessonFrame from './lesson-frame';


export default class LessonWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        courseUrl: PropTypes.string.isRequired,
        lessonCount: PropTypes.number.isRequired,
        isMain: PropTypes.bool,
        active: PropTypes.string.isRequired,
        isPlayer: PropTypes.bool.isRequired
    };

    static defaultProps = {
        isMain: true,
        isPlayer: false
    };

    render() {

        return (
            <section className='fullpage-section lecture-wrapper'
                     style={{backgroundImage: "url(" + '/data/' + this.props.lesson.Cover + ")"}}>
                <Menu {...this.props}
                      current={this.props.lesson.Number}
                      active={this.props.active}
                      total={this.props.lessonCount}
                      id={'lesson-menu-' + this.props.lesson.Id}
                />
                {
                    (this.props.isPlayer && !this.props.paused) ?
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