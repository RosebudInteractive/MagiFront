import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    // flex: "1 0 25%",
    flexDirection: 'row',
    width: 'auto',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 15,
    paddingVertical: 10,
  },
  text: {
    marginRight: 20,
  },
  picker: {
    minWidth: 200,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ccc',
  },
});
