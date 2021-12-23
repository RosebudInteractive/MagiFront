import React, { useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';

type Props = {
  color: string,
  isActive: boolean,
}

export default function Mask(props: Props) {
  const { color, isActive } = props;

  const stopColor = useMemo(() => (isActive ? `${props.color}CC` : props.color), [color, isActive]);

  return <LinearGradient style={styles.mask} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 0 }} locations={[0, 1]} colors={[`${color}00`, stopColor]} />;
}
