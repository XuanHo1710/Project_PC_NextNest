'use client';

import { FallOutlined, RiseOutlined } from "@ant-design/icons"
import { Tag, Spin } from "antd"
import { RxDashboard } from "react-icons/rx"
import { useOrderStats } from "@/hooks/admin/useOrder"

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

const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
};

const formatCurrency = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} triệu`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toLocaleString();
};

export const HeaderDashboard = () => {
    const { data: stats, isLoading } = useOrderStats();

    if (isLoading) {
        return (
            <div className="my-3 text-center py-8">
                <Spin size="large" />
            </div>
        );
    }

    const totalOrders = stats?.totalOrders ?? 0;
    const paidOrders = stats?.paidOrders ?? 0;
    const totalIncome = stats?.totalIncome ?? 0;
    const platformRevenue = stats?.platformRevenue ?? 0;

    return (
        <>
            <div className="my-3">
                <h2 className="text-xl font-semibold flex items-center">
                    <RxDashboard className="mr-2 text-blue-500" />
                    Dashboard
                </h2>
            </div>
            <div className="grid grid-flow-row grid-cols-12 gap-6">
                <CardDashBoard className="col-span-3" title="Tổng đơn hàng" value={formatNumber(totalOrders)} type="up" percent={0} totalMade={`${totalOrders} đơn`} />
                <CardDashBoard className="col-span-3" title="Đơn đã thanh toán" value={formatNumber(paidOrders)} type="up" percent={totalOrders > 0 ? Math.round(paidOrders / totalOrders * 100) : 0} totalMade={`${paidOrders} đơn đã TT`} />
                <CardDashBoard className="col-span-3" title="Tổng doanh thu" value={formatCurrency(totalIncome)} type="up" percent={0} totalMade={formatCurrency(totalIncome)} />
                <CardDashBoard className="col-span-3" title="Phí nền tảng (5%)" value={formatCurrency(platformRevenue)} type="up" percent={5} totalMade={formatCurrency(platformRevenue)} />
            </div>
        </>
    )
}