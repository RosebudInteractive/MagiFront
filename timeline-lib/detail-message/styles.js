import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    wrapper: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        width: '24%',
        borderRadius: 8,
        zIndex: 100,
        left: 21,
        maxWidth: 356,
    },
    header: {
        // height: 94,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 7,
        flex: 1,
        flexDirection: 'row',
    },
    headerText: {
        flex: 1,
        flexDirection: 'column',
    },
    details: {
        flexGrow: 1,
        backgroundColor: '#2F2F2F',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    description: {
        color: '#FFFFFF',
        fontFamily: 'Fira Sans',
        fontSize: 12,
        lineHeight: 16.8,
        maxHeight: 84,
        // @ts-ignore
        overflow: 'auto',
    },
    title: {
        color: '#FFFFFF',
        fontFamily: 'Fira Sans',
        fontSize: 15,
        lineHeight: 19.5,
        fontWeight: 'bold',
    },
    date: {
        color: '#FFFFFF',
        fontFamily: 'Fira Sans',
        fontSize: 13,
        lineHeight: 15.6,
        marginTop: 1,
    },
    button: {
        marginRight: 0,
    },
});
