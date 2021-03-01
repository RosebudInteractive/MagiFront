import React from 'react'
import './loading-page.sass'

// export default class Preloader extends React.PureComponent {
//     render() {
//         const _style = {width: "100%", height: "100%"}
//
//         return <div className="lds-css ng-scope preloader-wrapper">
//                 <div style={_style} className="lds-wedges">
//                     <div>
//                         <div>
//                             <div/>
//                         </div>
//                         <div>
//                             <div/>
//                         </div>
//                         <div>
//                             <div/>
//                         </div>
//                         <div>
//                             <div/>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//     }
// }

export default class Preloader extends React.PureComponent {
    render() {
        const _style = {width: "100%", height: "100%"}

        return <div className="lds-css ng-scope preloader-wrapper">
            <div className="lds-spinner" style={_style}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    }
}