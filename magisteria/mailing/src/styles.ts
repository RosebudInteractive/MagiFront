import React from "react";

type ComponentStyles = {
  CENTER_WRAPPER: React.CSSProperties,
  WEBKIT: React.CSSProperties,
  MAIN_TABLE: React.CSSProperties,
  MAIN_TABLE_EXT: React.CSSProperties,
  SPACE_TABLE: React.CSSProperties,
  CONTENT_TABLE: React.CSSProperties,
  LOGO: React.CSSProperties,
  LINK: React.CSSProperties,
  PARAGRAPH : {
    GREETING: React.CSSProperties,
    THANKSGIVING: React.CSSProperties,
    COMMON: React.CSSProperties,
    LAST: React.CSSProperties,
  },
  PROMO: React.CSSProperties,
}

export const STYLES: ComponentStyles = {
  CENTER_WRAPPER: {
    width: "100%",
    tableLayout: "fixed",
    paddingBottom: "7px",
  },

  WEBKIT: {
    maxWidth: "600px",
  },

  MAIN_TABLE: {
    borderSpacing: 0,
    fontFamily: "arial,helvetica,sans-serif",
    background: "#FFFFFF",
    borderCollapse: "collapse",
    margin: "0 auto",
    width: "100%",
    maxWidth: "600px",
    border: "none",
    verticalAlign: "top",
  },
  MAIN_TABLE_EXT: {
    borderSpacing: 0,
    fontFamily: "arial,helvetica,sans-serif",
    background: "#FFFFFF",
    borderCollapse: "collapse",
    margin: "0 auto",
    width: "100%",
    maxWidth: "640px",
    border: "none",
    verticalAlign: "top",
  },
  SPACE_TABLE: {
    width: "24px",
    padding: "0px",
    color: "rgb(255, 255, 255)"
  },
  CONTENT_TABLE: {
    padding: "0px",
  },

  LOGO: {
    height: "80px"
  },

  LINK: {
    fontStyle: "normal",
    color: "#C8684C",
    display: "inline",
    textDecoration: "none"
  },

  PARAGRAPH: {
    GREETING: {
      paddingTop: "30px",
      fontFamily: "Arial",
      fontSize: "23px",
      fontWeight: "bold",
      lineHeight: "130%",
    },
    THANKSGIVING: {
      paddingTop: "12px",
      fontFamily: "Arial",
      fontSize: "18px",
      fontWeight: "normal",
      lineHeight: "130%",
    },
    COMMON: {
      paddingTop: "15px",
      fontFamily: "Arial",
      fontSize: "18px",
      lineHeight: "130%",
    },
    LAST: {
      paddingTop: "15px",
      paddingBottom: "35px",
      fontFamily: "Arial",
      fontSize: "18px",
      lineHeight: "130%",
    },
  },

  PROMO: {
    display: "inline",
    paddingTop: "9px",
    paddingRight: "11px",
    paddingBottom: "9px",
    paddingLeft: "11px",
    fontFamily: "Arial",
    fontSize: "20px",
    lineHeight: "130%",
    fontWeight: "bold",
    color: "#2B2B2B",
    backgroundColor: "rgba(0, 0, 0, 0.05)"
  },
}
