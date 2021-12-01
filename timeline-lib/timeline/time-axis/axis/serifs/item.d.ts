import React from 'react';
import { LayoutRectangle } from 'react-native';
declare type Props = {
    yearPerPixel: number;
    startDate: number;
    year: number;
    rightBound: number;
};
declare type State = {
    textOffset: number;
    visible: boolean;
};
declare class SerifItem extends React.Component<Props, State> {
    private readonly textRef;
    constructor(props: Props);
    componentDidUpdate(): void;
    onLayout(data: LayoutRectangle): void;
    render(): false | JSX.Element;
}
export default SerifItem;
