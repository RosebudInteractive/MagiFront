import React from "react";
import "./discount-block.sass";
import LinkedButton from "../linked-button";
const STYLE = {
    TABLE: {
        borderSpacing: "0",
        fontFamily: "arial,helvetica,sans-serif",
        background: "#FFFFFF",
        borderCollapse: "collapse",
        border: "none",
        verticalAlign: "top",
    },
    TABLE_ROW: {
        paddingTop: "15px",
        paddingBottom: "15px",
    },
    HEADER: {
        paddingTop: "18px",
        fontFamily: "Arial",
        fontSize: "18px",
        lineHeight: "130%",
        fontWeight: "bold",
    },
    DISCOUNT: {
        HEADER: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "23px",
            lineHeight: "130%",
            color: "#2F2F2F",
        },
        DESCR: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "18px",
            lineHeight: "130%",
            color: "#000000",
            paddingTop: "6px",
        },
        PROMO_ROW: {
            paddingTop: "4px",
            paddingBottom: "15px",
            display: "block",
            width: "100%"
        },
        PROMO: {
            display: "block",
            paddingTop: "9px",
            paddingRight: "11px",
            paddingBottom: "9px",
            paddingLeft: "11px",
            fontFamily: "Arial",
            fontSize: "20px",
            lineHeight: "130%",
            fontWeight: "bold",
            color: "#2B2B2B",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            textAlign: "center"
        },
    },
    MOBILE: {
        ROW: {
            display: "none",
            height: 0,
            overflow: "hidden",
        },
        DISCOUNT: {
            TABLE: {
                borderSpacing: 0,
                fontFamily: "arial,helvetica,sans-serif",
                background: "#FFFFFF",
                borderCollapse: "collapse",
                margin: "0 auto",
                border: "none",
                display: "none",
                height: 0,
                overflow: "hidden",
            },
            BODY: {
                paddingTop: "8px",
                display: "none",
                height: 0,
                overflow: "hidden",
            },
            RECORD: {
                display: "none",
                height: 0,
                overflow: "hidden",
            },
            PROMO_ROW: {
                paddingTop: "4px",
                paddingBottom: "15px",
                display: "none",
                width: "100%",
                height: 0,
                overflow: "hidden",
            },
            PROMO: {
                display: "none",
                paddingTop: "9px",
                paddingRight: "11px",
                paddingBottom: "9px",
                paddingLeft: "11px",
                fontFamily: "Arial",
                fontSize: "20px",
                lineHeight: "130%",
                fontWeight: "bold",
                color: "#2B2B2B",
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                textAlign: "center"
            },
        }
    }
};
export default function DiscountBlock(props) {
    const { promo, header, description } = props;
    return <tr>
    <td style={STYLE.TABLE_ROW}>
      <table className="course-promo__table">
        <tbody>
        <tr>
          <td>
            {/* @ts-ignore */}
            <table style={STYLE.TABLE} align="left" width="56%" className="column-table _left">
              <tr style={STYLE.DISCOUNT.HEADER}>
                <td>{header}</td>
              </tr>
              <tr style={STYLE.DISCOUNT.DESCR}>
                <td>{description}</td>
              </tr>
            </table>
            {/* @ts-ignore */}
            <table style={STYLE.TABLE} align="right" width="40%" className="column-table _right">
              <tr style={{ display: "block" }}>
                <td style={STYLE.DISCOUNT.PROMO_ROW}>
                  <div style={STYLE.DISCOUNT.PROMO}>{promo}</div>
                </td>
              </tr>
              <tr>
                <LinkedButton caption={"Выбрать курс"} link={window.location.origin} isMobile={false}/>
              </tr>
            </table>
          </td>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>;
}
