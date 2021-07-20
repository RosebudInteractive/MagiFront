import React from 'react'
import {Animated} from "react-native";

export function withAnimated(WrappedComponent) {

    class ComponentWithAnimated extends React.Component {
        render() {
            return <WrappedComponent {...this.props} />;
        }
    }
    return Animated.createAnimatedComponent(ComponentWithAnimated);
}
