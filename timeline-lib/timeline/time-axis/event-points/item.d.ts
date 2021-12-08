import React from 'react';
import { LayoutChangeEvent, NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { Event } from '../../../types/event';
declare type Props = {
    item: Event.VisualItem;
    onMount: Function;
    onClick: Function;
    x: number;
    y: number;
    visible: boolean;
    level: number;
    isActive: boolean;
    index: number;
    axisY: number;
    zIndex: number;
    onLastPoint?: Function;
};
declare type State = {
    needMask: boolean;
    flagHeight: number;
    opacity: any;
    top: any;
    scale: any;
    indent: any;
    footIndent: any;
};
export default class EventPoint extends React.PureComponent<Props, State> {
    private opacityAnim;
    private verticalAnim;
    private readonly setViewRef;
    private viewRef;
    constructor(props: Props);
    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void;
    onTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>): void;
    onTextContainerLayout(event: LayoutChangeEvent): void;
    onViewLayout(event: LayoutChangeEvent): void;
    onClick(): void;
    render(): JSX.Element;
}
export {};
