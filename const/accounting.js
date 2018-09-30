'use strict';

exports.Accounting = {
    SumPrecision: 2,
    ComparePrecision: 0.005,
    DfltCurrencyId: 1,
    DfltCurrencyCode: "RUB",
    InvoiceType: {
        Purchase: 1,
        Refund: 2
    },
    InvoiceState: {
        Draft: 1,
        Approved: 2,
        Payed: 3,
        Canceled: 4
    }
};
