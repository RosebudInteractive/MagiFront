'use strict';

exports.Accounting = {
    SumPrecision: 2,
    ComparePrecision: 0.005,
    DfltCurrencyId: 1,
    DfltCurrencyCode: "RUB",
    SubsProdType: 1,
    ProductReqParams: {
        TypeCode: "SUBS",
        Detail: "true",
        Discontinued: "0"
    },
    InvoiceType: {
        Purchase: 1,
        Refund: 2
    },
    InvoiceState: {
        Draft: 1,
        Approved: 2,
        Paid: 3,
        Canceled: 4
    },
    ChequeType: {
        Payment: 1,
        Refund: 2
    },
    ChequeState: {
        Draft: 1,
        Pending: 2,
        WaitForCapture: 3,
        Succeeded: 4,
        Canceled: 5,
        Error: 6
    },
    ReceiptState: {
        Pending: 1,
        Succeeded: 2,
        Canceled: 3
    }
};
