import React from 'react';
import { LayoutChangeEvent } from 'react-native';
import { Period } from '../../../types/period';
declare type Props = {
    period: Period.VisualItem;
    startX: number;
    endX: number;
    y: number;
    visible: boolean;
    isActive: boolean;
    onClick?: Function;
    index: number;
};
declare type State = {
    opacity: any;
    top: any;
    showDate: boolean;
    showTitle: boolean;
};
export default class AnimatedPeriod extends React.Component<Props, State> {
    private opacityAnim;
    private verticalAnim;
    private dateWidth;
    private titleWidth;
    private periodWidth;
    constructor(props: Props);
    calculateTextVisible(): void;
    UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void;
    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void;
    onPress(): void;
    onPeriodLayout(event: LayoutChangeEvent): void;
    render(): JSX.Element;
}
export {};
