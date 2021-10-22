import React from 'react';
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
};
export default class AnimatedPeriod extends React.Component<Props, State> {
    private opacityAnim;
    private verticalAnim;
    constructor(props: Props);
    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void;
    onPress(): void;
    render(): JSX.Element;
}
export {};
