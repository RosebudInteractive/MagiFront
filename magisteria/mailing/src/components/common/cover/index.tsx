import React from "react"

type Styles = {
  TITLE: React.CSSProperties,
  IMG: React.CSSProperties,
  IMAGE_CELL: React.CSSProperties,
  COURSE: {
    WRAPPER: React.CSSProperties,
    TITLE: React.CSSProperties,
    NAME: React.CSSProperties,
  },
}

const STYLE: Styles = {
  TITLE: {
    fontFamily: "Arial",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "12px",
    lineHeight: "140%",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "20px 0 15px",
    color: "#2B2B2B",
  },
  COURSE: {
    WRAPPER: {
      paddingBottom: "20px",
    },
    TITLE: {
      display: "inline",
      fontFamily: "Georgia",
      fontStyle: "italic",
      fontWeight: "normal",
      fontSize: "24px",
      lineHeight: "120%",
      color: "#C8684C",
    },
    NAME: {
      display: "inline",
      fontFamily: "Georgia",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "24px",
      lineHeight: "120%",
      color: "#2F2F2F",
    },
  },
  IMG: {
    border: 0,
    width: "100%",
    display: "block",
  },
  IMAGE_CELL: {
    width: "552px",
  }
}

type Props = {
  linkUrl: string;
  imageUrl: string;
  altText: string;
  height?: number;
}

export default function Cover(props: Props): JSX.Element {

  const {imageUrl, linkUrl, altText, height} = props;

  return <React.Fragment>
    <tr>
      <td style={STYLE.IMAGE_CELL}>
        <a target="_blank" href={linkUrl}>
          {
            height
              ? <img src={imageUrl} width="552" height={height.toString()} alt={altText} style={STYLE.IMG}/>
              : <img src={imageUrl} width="552" alt={altText} style={STYLE.IMG}/>
          }
        </a>
      </td>
    </tr>
  </React.Fragment>
}
