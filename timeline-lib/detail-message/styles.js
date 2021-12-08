import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    wrapper: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        zIndex: 10,
        left: 21,
    },
    header: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingLeft: 16,
        paddingRight: 8,
        paddingTop: 16,
        paddingBottom: 8,
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
        paddingTop: 10,
        paddingBottom: 16,
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
        marginLeft: 8,
        marginRight: 0,
    },
});
