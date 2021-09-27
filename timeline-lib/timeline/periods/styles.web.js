import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    period: {
        position: 'absolute',
        borderRadius: 4,
        flexDirection: 'row',
        overflow: 'hidden',
        height: 24,
        justifyContent: 'flex-start',
        alignItems: 'center',
        cursor: 'pointer',
    },
    title: {
        color: 'white',
        fontFamily: 'Fira Sans',
        fontWeight: '400',
        fontSize: 10,
    },
    dateTitle: {
        opacity: 0.57,
        marginHorizontal: 8,
    },
});
