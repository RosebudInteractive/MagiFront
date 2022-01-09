import React from "react";
import { STYLES } from "../styles";
import Logo from "../components/common/logo";
import Cover from "../components/common/cover";
import Social from "../components/common/social";
import DiscountBlock from "../components/common/discount-block";
import "../components/common/common.sass";
const IMAGE_URL = window.location.origin + '/data/2022/01/birthday-5-6f728f0d-0d44-4431-b5d1-6d8f9e58338e.png';
function getGift(giftType) {
    switch (giftType) {
        case '1':
            return {
                header: 'Промокод на скидку 50% (2 курса)',
                text: 'промокодом со скидкой 50% на два любых из наших курсов'
            };
        case '2':
            return {
                header: 'Промокод на 1 курс',
                text: 'промокодом на активацию любого из наших платных курсов'
            };
        case '3':
            return {
                header: 'Промокод  на 2 курса',
                text: 'промокодом на активацию двух любых платных курсов'
            };
        default:
            return null;
    }
}
export default function OurBirthday() {
    const params = new URLSearchParams(window.location.search), username = params.get('username'), promo = params.get('promo') || '', giftType = params.get('giftType') || '', message = `Добрый день${username ? `, ${username}` : ''}!`;
    const gift = getGift(giftType);
    if (!gift)
        return <table style={STYLES.MAIN_TABLE}/>;
    // @ts-ignore
    return <table align="center" style={STYLES.MAIN_TABLE}>
    <tbody>
    <tr>
      <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
      <td style={STYLES.CONTENT_TABLE}>
        {/* @ts-ignore */}
        <table align="center" style={STYLES.MAIN_TABLE}>
          <tbody>
          <Logo />
          <Cover altText={'Нам 5 лет!'} linkUrl={window.location.origin} imageUrl={IMAGE_URL} height={165}/>
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
                  <td style={STYLES.PARAGRAPH.COMMON}>23 декабря Магистерии исполнилось 5 лет. С 2017 года мы выросли и
                    стали зрелым проектом, выпустили около 100 циклов лекций, существенная доля которых остается в
                    открытом доступе. Некоторые курсы стали платными, эти продажи позволяют нам создавать больше
                    контента
                    и активнее развивать платформу.
                  </td>
                </tr>
                <tr>
                  <td style={STYLES.PARAGRAPH.COMMON}>
                    {`Так как Вы следите за Магистерией и интересуетесь нашими материалами, мы решили порадовать Вас 
                      ${gift.text}. Вы можете воспользоваться им в течение всего года вплоть до 31 декабря.`}
                  </td>
                </tr>
                <DiscountBlock promo={promo} header={gift.header} description={<div>Используйте промокод для любого из платных курсов до 31&nbsp;декабря
                                 2022</div>}/>
                <tr>
                  <td style={STYLES.PARAGRAPH.LAST}>
                    Надеемся, что этот подарок будет Вам приятен и принесет пользу в важном деле саморазвития.
                  </td>
                </tr>
                <tr>
                  <td style={STYLES.PARAGRAPH.LAST}>С наилучшими пожеланиями в Новом Году, Магистерия.</td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <Social />
          </tbody>
        </table>
      </td>
      <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
    </tr>
    </tbody>
  </table>;
}
