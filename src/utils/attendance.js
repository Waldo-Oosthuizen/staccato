import { format } from 'date-fns';

export const getLocalDate = (date = new Date()) =>
  format(date, 'yyyy-MM-dd');
