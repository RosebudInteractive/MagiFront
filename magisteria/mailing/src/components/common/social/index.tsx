import React from "react"

type Styles = {
  SOCIAL: {
    CELL: React.CSSProperties,
    PADDING_CELL: React.CSSProperties,
  }
}

const STYLE: Styles = {
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
}

const twUrl = "https://twitter.com/MagisteriaRu",
    vkUrl = "https://vk.com/magisteriaru";
    // fbUrl = "https://www.facebook.com/Magisteria.ru/",
    // okUrl = "https://ok.ru/group/54503517782126";


export default function Social(): JSX.Element {
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
  </tr>
}
