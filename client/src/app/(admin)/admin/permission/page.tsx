import SelectRole from "@/components/SelectItem/SelectRole";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Trang phân quyền'
};

export default function Permission() {
  return (
    <>
      <div className="py-2">
        <h2 className="text-center text-2xl font-bold">Trang phân quyền</h2>
        <SelectRole />
      </div>
    </>
  );
}
