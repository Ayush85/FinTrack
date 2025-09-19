import {StyleSheet} from 'react-native';
import {COLORS} from '../constants';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 5,
    color: COLORS.TEXT.PRIMARY,
  },
  safeArea: {
    flex: 1,
  },
});
