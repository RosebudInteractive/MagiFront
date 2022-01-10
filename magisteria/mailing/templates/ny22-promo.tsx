import React from "react"

import { STYLES } from "../styles";
import Logo from "../components/common/logo";
import Cover from "../components/common/cover";
import Social from "../components/common/social";
import DiscountBlock from "../components/common/discount-block";
import "../components/common/common.sass"

const IMAGE_URL: string = window.location.origin + '/data/2022/01/birthday-5-6f728f0d-0d44-4431-b5d1-6d8f9e58338e.png'

type Gift = {
  header: string,
  winnerCount: number,
  courseCount: number,
}

function getGift(giftType: string): Gift | null {
  switch (giftType) {
    case '1':
      return {
        header: 'Промокод на 25 курсов',
        winnerCount: 5,
        courseCount: 25,
      }
    case '2':
      return {
        header: 'Промокод на 5 курсов',
        winnerCount: 25,
        courseCount: 5,
      }
    default :
      return null
  }
}

export default function NY22Promo(): JSX.Element {

  const params = new URLSearchParams(window.location.search),
    username: string | null = params.get('username'),
    promo: string = params.get('promo') || '',
    giftType: string = params.get('giftType') || '',
    message: string = `Добрый день${username ? `, ${username}` : ''}!`;

  const gift: Gift | null = getGift(giftType);

  if (!gift) return <table style={STYLES.MAIN_TABLE}/>

  // @ts-ignore
  return <table align="center" style={STYLES.MAIN_TABLE}>
    <tbody>
    <tr>
      <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
      <td style={STYLES.CONTENT_TABLE}>
        {/* @ts-ignore */}
        <table align="center" style={STYLES.MAIN_TABLE}>
          <tbody>
          <Logo/>
          <Cover altText={'Win'} linkUrl={window.location.origin} imageUrl={IMAGE_URL} height={165}/>
          <tr>
            <td>
              <table>
                <tbody>
                <tr>
                  <td style={STYLES.PARAGRAPH.GREETING}>
                    {message}
                  </td>
                </tr>
                <tr>
                  <td style={STYLES.PARAGRAPH.COMMON}>
                    {
                      `Накануне Нового Года мы объявили о конкурсе, приуроченном к 5-летию нашего проекта, в котором 
                      поучаствуют все, кто купил хотя бы один курс после 1 декабря 2021 года. Среди этих людей мы 
                      отобрали ${gift.winnerCount} победителей, кому мы вручаем бессрочные промокоды на 
                      ${gift.courseCount} курсов. И рады сообщить, что одним из этих счастливчиков стали Вы!`
                    }
                  </td>
                </tr>
                <tr>
                  <td style={STYLES.PARAGRAPH.COMMON}>
                    Ниже - промокод, который Вы можете использовать для получения любых курсов совершенно бесплатно и в
                    любое время, когда Вам потребуется тот или иной цикл лекций.
                  </td>
                </tr>
                <DiscountBlock promo={promo}
                               header={gift.header}
                               description={'Используйте промокод для любого из платных курсов Магистерии!'}/>
                <tr>
                  <td style={STYLES.PARAGRAPH.LAST}>
                    Надеемся, что этот выигрыш порадует Вас и принесет пользу в таком важном деле, как саморазвитие!
                  </td>
                </tr>
                <tr>
                  <td style={STYLES.PARAGRAPH.LAST}>С наилучшими пожеланиями в Новом Году, Магистерия.</td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <Social/>
          </tbody>
        </table>
      </td>
      <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
    </tr>
    </tbody>
  </table>
}
