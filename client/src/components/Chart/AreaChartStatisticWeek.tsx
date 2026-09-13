'use client'

import { Card, Select, Typography, Spin } from "antd"
import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useOrderStats } from "@/hooks/admin/useOrder"

const { Title, Text } = Typography

const formatCurrency = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}tr`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toLocaleString();
};

export const AreaChartStatisticWeek = () => {
    const [timeRange, setTimeRange] = useState("90d")
    const { data: stats, isLoading } = useOrderStats()

    const dailyOrders = stats?.dailyOrders || []

    const filteredData = dailyOrders.filter((item: { _id: string }) => {
        const date = new Date(item._id)
        const now = new Date()
        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }
        const startDate = new Date(now)
        startDate.setDate(startDate.getDate() - daysToSubtract)
        return date >= startDate
    })

    const totalOrders = filteredData.reduce((sum: number, d: { orders: number }) => sum + d.orders, 0)
    const totalRevenue = filteredData.reduce((sum: number, d: { revenue: number }) => sum + d.revenue, 0)

    if (isLoading) {
        return (
            <Card>
                <div className="flex items-center justify-center py-20">
                    <Spin size="large" />
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 20, marginBottom: 20 }}>
                <div>
                    <Title level={5} style={{ margin: 0 }}>Đơn hàng & Doanh thu</Title>
                    <Text type="secondary">
                        {totalOrders} đơn | {formatCurrency(totalRevenue)}đ doanh thu
                    </Text>
                </div>
                <Select value={timeRange} onChange={setTimeRange} style={{ width: 160 }}>
                    <Select.Option value="90d">3 tháng gần đây</Select.Option>
                    <Select.Option value="30d">30 ngày gần đây</Select.Option>
                    <Select.Option value="7d">7 ngày gần đây</Select.Option>
                </Select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={filteredData}>
                    <defs>
                        <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgb(26, 142, 255)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="rgb(26, 142, 255)" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="_id"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                        }}
                    />
                    <Tooltip
                        labelFormatter={(value) => {
                            return new Date(value).toLocaleDateString("vi-VN", { month: "long", day: "numeric", year: "numeric" })
                        }}
                        formatter={(value: number, name: string) => {
                            if (name === 'revenue') return [formatCurrency(value), 'Doanh thu'];
                            return [value, 'Đơn hàng'];
                        }}
                    />
                    <Legend
                        formatter={(value) => value === 'orders' ? 'Đơn hàng' : 'Doanh thu'}
                    />
                    <Area
                        dataKey="orders"
                        type="natural"
                        fill="url(#fillOrders)"
                        stroke="rgb(26, 142, 255)"
                        name="orders"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    )
}
