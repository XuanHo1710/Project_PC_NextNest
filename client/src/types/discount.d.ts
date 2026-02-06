// ============== DISCOUNT ==============

import dayjs from "dayjs";

export interface IDiscount {
  _id?: string;
  name: string;
  description: string;
  type: string | boolean;
  startDate: string;
  endDate: string;
  valueDiscount: number;
  status: string;
  date: dayjs.Dayjs[];
}
