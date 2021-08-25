import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  event: {
    height: 18,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 8,
    cursor: 'pointer',
  },
  mask: {
    top: 0,
    height: 18,
    left: 4,
  },
  title: {
    color: 'white',
    fontFamily: 'Fira Sans',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 18,
    width: 'auto',
    marginTop: 2,
  },
  date: {
    marginLeft: 8,
  },
  flagpole: {
    position: 'absolute',
    width: 1,
    left: 0,
    bottom: 0,
    height: '100%',
  },
});
