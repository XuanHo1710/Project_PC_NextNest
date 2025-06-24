import { FallOutlined, RiseOutlined } from "@ant-design/icons"
import { Tag } from "antd"
import { RxDashboard } from "react-icons/rx"

interface ICardReport {
    className: string,
    title: string,
    value: string,
    type: string,
    percent: number,
    totalMade: string
}

const CardDashBoard = ({ className, title, value, type, percent, totalMade }: ICardReport) => {
    return (
        <>
            <div className={className + " rounded-sm p-4 bg-white border-[1px] border-solid border-slate-200"}>
                <h2 className="text-slate-400 text-sm font-semibold">{title}</h2>
                <div className="flex my-1 items-center gap-5">
                    <h2 className="text-xl font-semibold">{value}</h2>
                    {type === "up" ?
                        <Tag className="!text-sm" color="blue" icon={<RiseOutlined />}>{percent}%</Tag>
                        :
                        <Tag className="!text-sm" color="orange" icon={<FallOutlined />}>{percent}%</Tag>
                    }
                </div>
                <h2 className="text-slate-400 text-xs font-semibold mt-5">You made an extra <span className="text-blue-500">{totalMade}</span> this year</h2>
            </div>
        </>
    )
}


export const HeaderDashboard = () => {
    return (
        <>
            <div className="my-3">
                <h2 className="text-xl font-semibold flex items-center">
                    <RxDashboard className="mr-2 text-blue-500" />
                    Dashboard
                </h2>
            </div>
            <div className="grid grid-flow-row grid-cols-12 gap-6">
                <CardDashBoard className="col-span-3" title="Total Page Views" value="2,000,000" type="up" percent={20.5} totalMade="20,000" />
                <CardDashBoard className="col-span-3" title="Total Users" value="78,250" type="up" percent={50.5} totalMade="8,000" />
                <CardDashBoard className="col-span-3" title="Total Order" value="18,250" type="down" percent={50.5} totalMade="8,000" />
                <CardDashBoard className="col-span-3" title="Total Sales" value="78,250" type="down" percent={50.5} totalMade="8,000" />
            </div>
        </>
    )
}