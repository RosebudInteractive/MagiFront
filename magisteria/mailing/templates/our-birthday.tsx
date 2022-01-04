import React from "react"

import { STYLES } from "../styles";
import Logo from "../components/common/logo";
import Cover from "../components/common/cover";
import Social from "../components/common/social";
import DiscountBlock from "../components/common/discount-block";
import "../components/common/common.sass"

const IMAGE_URL: string = window.location.origin + '/data/2019/10/boke-vetki-makro-1571045055360.jpg'

type Gift = {
  header: string,
  text: string,
}

function getGift(giftType: string): Gift | null {
  switch (giftType) {
    case '1':
      return {
        header: 'Промокод на скидку 50% (2 курса)',
        text: 'промокод со скидкой 50% на два любых из наших курсов'
      }
    case '2':
      return {
        header: 'Промокод на 1 курс',
        text: 'промокод на активацию любого из наших платных курсов'
      }
    case '3':
      return {
        header: 'Промокод  на 2 курса',
        text: 'промокод на активацию двух любых платных курсов'
      }
    default :
      return null
  }
}

export default function OurBirthday(): JSX.Element {

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
          <Cover altText={'Нам 5 лет!'} linkUrl={window.location.origin} imageUrl={IMAGE_URL}/>
          <tr>
            <td>
              <tr>
                <td style={STYLES.PARAGRAPH.GREETING}>
                  {message}
                </td>
              </tr>
              <tr>
                <td style={STYLES.PARAGRAPH.COMMON}>23 декабря Магистерии исполнилось 5 лет. С 2017 года мы выросли и
                  стали зрелым проектом, выпустили около 100 курсов, существенная доля которых остается в открытом
                  доступе. Другая часть курсов стала платной, что позволяет нам увеличивать производство лекций,
                  обогащать их новыми инструментами и развивать нашу платформу.
                </td>
              </tr>
              <tr>
                <td style={STYLES.PARAGRAPH.COMMON}>
                  {
                    `Так как Вы следите за Магистерией и интересуетесь нашими курсами, мы приняли решение порадовать Вас
                    подарком - это ${gift.text}. Вы можете воспользоваться им в течение всего года вплоть до 31 декабря.`
                  }
                </td>
              </tr>
              <DiscountBlock promo={promo}
                             header={gift.header}
                             description={<div>используйте промокод для любого из платных курсов до 31&nbsp;декабря 2022</div>}/>
              <tr>
                <td style={STYLES.PARAGRAPH.LAST}>
                  Надеемся, что этот подарок порадует Вас и принесет пользу в важном деле саморазвития.
                </td>
              </tr>
              <tr>
                <td style={STYLES.PARAGRAPH.LAST}>С наилучшими пожеланиями в Новом Году, Магистерия.</td>
              </tr>
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
