import { RxDashboard } from "react-icons/rx";
import { AreaChartStatisticWeek } from "@/components/Chart/AreaChartStatisticWeek";
import { BarChartStatisticWeek } from "@/components/Chart/BarChartStatisticWeek";
import { SaleChartStatistic } from "@/components/Chart/SaleChartStatistic";
import { TableReport } from "@/components/TableContent/TableReport";
import { HeaderDashboard } from "@/components/CardDashboard/CardDashboard";


export default function Home() {
  return (
    <>
      <div className="py-2">
        <h2 className="text-center text-2xl font-bold">Trang tổng quan</h2>
        {/* Header dashboard */}
        <HeaderDashboard />
        {/* Statistic */}
        <div className="my-3">
          <h2 className="text-xl font-semibold flex items-center">
            <RxDashboard className="mr-2 text-blue-500" />
            Statistic
          </h2>
        </div>
        <div className="grid grid-flow-row grid-cols-12 gap-6">
          {/* Area chart */}
          <div className="col-span-8">
            <AreaChartStatisticWeek />
          </div>

          {/* Bar chart */}
          <div className="col-span-4 h-full">
            <BarChartStatisticWeek />
          </div>
        </div>

        {/* Report */}
        <div className="my-3">
          <h2 className="text-xl font-semibold flex items-center">
            <RxDashboard className="mr-2 text-blue-500" />
            Report
          </h2>
        </div>
        {/* Recent Orders */}
        <h2 className="font-semibold my-5">Recent Orders</h2>
        <TableReport />
        {/* Sales Report */}
        <h2 className="font-semibold my-5">Sales Report</h2>
        {/* Sales chart */}
        <SaleChartStatistic />
      </div>
    </>
  );
}
