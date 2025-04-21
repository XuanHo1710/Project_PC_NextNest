import { Button } from "antd";
import { CiExport, CiImport } from "react-icons/ci";
import { FaFileAlt, FaRegMoneyBillAlt } from "react-icons/fa";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { RiCustomerService2Line } from "react-icons/ri";
import { RxDashboard } from "react-icons/rx";
import ColumnChart from "../../../../../components/ColumnChart/ColumnChart";


export default function Home() {
  return (
    <>
    <div className="py-2">
        <h2 className="text-center text-2xl font-bold">Trang tổng quan</h2>
        <div className="my-3">
          <h2 className="text-xl font-semibold flex items-center">
            <RxDashboard className="mr-2 text-blue-500" /> 
            Tổng quan
          </h2>
        </div>
        {/* <div className="grid grid-flow-row grid-cols-12 gap-5">
          <div className="col-span-4 rounded-2xl p-3 bg-blue-50 border-2 border-solid border-blue-200">
              <div className="flex justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Số lượng</h2>
                    <p className="text-blue-500 font-bold text-4xl my-3">120</p>
                    <p className="text-sm text-slate-600">Tăng hơn <span className="text-green-500 font-semibold">6,2%</span> so với tháng vừa rồi</p>
                  </div>
                  <div className="border max-h-max border-blue-500 rounded-md mt-1 p-2">
                    <MdOutlineProductionQuantityLimits className="text-2xl text-blue-500" />
                  </div>
              </div>
          </div>
          <div className="col-span-4 rounded-2xl p-3 bg-blue-50 border-2 border-solid border-blue-200">
              <div className="flex justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Lợi nhuận</h2>
                    <p className="text-blue-500 font-bold text-4xl my-3">230,032,000 VNĐ</p>
                    <p className="text-sm text-slate-600">Tăng hơn <span className="text-green-500 font-semibold">6,2%</span> so với tháng vừa rồi</p>
                  </div>
                  <div className="border max-h-max border-blue-500 rounded-md mt-1 p-2">
                    <FaRegMoneyBillAlt className="text-2xl text-blue-500" />
                  </div>
              </div>
          </div>
          <div className="col-span-4 rounded-2xl p-3 bg-blue-50 border-2 border-solid border-blue-200">
              <div className="flex justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Khách hàng mới</h2>
                    <p className="text-blue-500 font-bold text-4xl my-3">32 người</p>
                    <p className="text-sm text-slate-600">Tăng hơn <span className="text-green-500 font-semibold">6,2%</span> so với tháng vừa rồi</p>
                  </div>
                  <div className="border max-h-max border-blue-500 rounded-md mt-1 p-2">
                    <RiCustomerService2Line className="text-2xl text-blue-500" />
                  </div>
              </div>
          </div>
        </div>
        <div className="my-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <FaFileAlt  className="mr-2 text-blue-500" /> 
            Báo cáo
          </h2>
          <div className="flex items-center gap-5">
            <Button icon={<CiImport />} >Import</Button>
            <Button icon={<CiExport />} >Export</Button>
          </div>
        </div>
        <ColumnChart></ColumnChart> */}
    </div>
    </>
  );
}
