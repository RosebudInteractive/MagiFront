import React from 'react';
import { TouchableOpacity, View, } from 'react-native';
import style from './style';
import OpenButton from './open-full-screen';
import CloseButton from './close-full-screen';
import ZoomSlider from './zoom-slider';
export default function Footer(props) {
    const { fullScreenMode, zoom, onOpenPress, onClosePress, onZoomChange, onSliderStop, } = props;
    return (<View style={[style.footer]}>
      <ZoomSlider value={zoom} onChange={onZoomChange} onSliderStop={onSliderStop}/>
      {fullScreenMode
            ? (<TouchableOpacity onPress={onClosePress} style={{outline: 'none'}}>
            <View style={style.button}>
              <CloseButton />
            </View>
          </TouchableOpacity>)
            : (<TouchableOpacity onPress={onOpenPress} style={{outline: 'none'}}>
            <View style={style.button}>
              <OpenButton />
            </View>
          </TouchableOpacity>)}
    </View>);
}
