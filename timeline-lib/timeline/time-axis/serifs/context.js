import React from 'react';
const SerifsContext = React.createContext({
    needCorrectionOnBC: false,
    isDeprecatedBrowser: false,
    zoom: 1,
    theme: null,
});
export default SerifsContext;
