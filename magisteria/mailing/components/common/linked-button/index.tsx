import React from "react"
import "./linked-button.sass"

type Styles = {
  CELL: React.CSSProperties,
  BUTTON: {
    TABLE: React.CSSProperties,
    MOBILE_CELL: React.CSSProperties,
    CELL: React.CSSProperties,
    ITEM: React.CSSProperties,
    LINK: React.CSSProperties,
  }
}

const STYLE: Styles = {
  CELL: {
    padding: "20px 0 0",
  },
  BUTTON: {
    TABLE: {
      width: "100%",
      borderCollapse: "collapse",
      height: "43px"
    },
    MOBILE_CELL: {
      padding: "0",
      width: "100%",
      display: "none",
      height: 0,
      maxHeight: 0,
      overflow: "hidden"
    },
    CELL: {
      padding: "0",
      width: "100%",
      display: "block",
    },
    ITEM: {
      padding: "11px 0",
      width: "100%",
      background: "#C8684C",
      fontFamily: "Arial",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: "15px",
      lineHeight: "140%",
      textAlign: "center",
      letterSpacing: "0.1em",
      color: "#FFFFFF",
      borderRadius: "4px",
      cursor: "pointer",
    },
    LINK: {
      textDecoration: "none",
      textTransform: "uppercase",
      color: "#FFFFFF",
      display: "inline-block",
      width: "100%"
    }
  },
}

type Props = {
  link: string,
  caption: string,
}

export default function LinkedButton(props: Props): JSX.Element {

  const {link, caption,} = props;

  return <td style={STYLE.BUTTON.CELL}>
    <a target="_blank" href={link} style={STYLE.BUTTON.LINK}>
      <table style={STYLE.BUTTON.TABLE} cellSpacing="0">
        <tbody>
        <tr>
          <td style={STYLE.BUTTON.ITEM} className="linked-button">
            <a target="_blank" href={link} style={STYLE.BUTTON.LINK}>
              <span style={STYLE.BUTTON.LINK}>{caption}</span>
            </a>
          </td>
        </tr>
        </tbody>
      </table>
    </a>
  </td>
}
