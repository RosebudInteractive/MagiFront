import React from "react";
import Card from "./card.svg"
import Play from "./play.svg"
import "./availability-title.sass"

export default function AvailabilityTitle(): JSX.Element {
  return <div className="course__availability-title">
    <div className="course__availability-title__item font-universal__body-small _first">
      <div className="_image">
        <Card/>
      </div>
      <div className="_text">После покупки курс будет доступен всегда</div>
    </div>
    <div className="course__availability-title__item font-universal__body-small">
      <div className="_image">
        <Play/>
      </div>
      <div className="_text">Смотреть, слушать и читать можно будет в любое удобное время</div>
    </div>
  </div>
}
