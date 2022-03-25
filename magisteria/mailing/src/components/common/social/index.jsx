import React from "react";
const STYLE = {
    SOCIAL: {
        CELL: {
            height: "62px",
            padding: 0,
            textAlign: "center",
        },
        PADDING_CELL: {
            width: "24px",
        }
    },
};
const fbUrl = "https://www.facebook.com/Magisteria.ru/", 
// eslint-disable-next-line no-unused-vars
okUrl = "https://ok.ru/group/54503517782126", twUrl = "https://twitter.com/MagisteriaRu", vkUrl = "https://vk.com/magisteriaru";
export default function Social() {
    return <tr>
    <td style={STYLE.SOCIAL.CELL}>
      {/* @ts-ignore */}
      <table align="center">
        <tbody>
        <tr>
          <td>
            <a target="_blank" href={twUrl}>
              <img src={window.location.origin + '/images/mail-tw.png'} alt={'twitter'}/>
            </a>
          </td>
          <td style={STYLE.SOCIAL.PADDING_CELL}/>
          {/*<td>*/}
          {/*  <a target="_blank" href={fbUrl}>*/}
          {/*    <img src={window.location.origin + '/images/mail-fb.png'} alt={'facebook'}/>*/}
          {/*  </a>*/}
          {/*</td>*/}
          <td style={STYLE.SOCIAL.PADDING_CELL}/>
          <td>
            <a target="_blank" href={vkUrl}>
              <img src={window.location.origin + '/images/mail-vk.png'} alt={'vk'}/>
            </a>
          </td>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>;
}
