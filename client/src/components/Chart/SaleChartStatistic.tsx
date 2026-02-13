'use client'

import { Bar, BarChart, ResponsiveContainer, YAxis, CartesianGrid, XAxis, Tooltip } from "recharts"
import { useState } from "react"
import { Card, Checkbox, Spin, Typography } from "antd"
import { useOrderStats } from "@/hooks/admin/useOrder"

const { Text } = Typography

const formatCurrency = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}tr`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toLocaleString();
};

export const SaleChartStatistic = () => {
    const [showIncome, setShowIncome] = useState(true)
    const [showOrders, setShowOrders] = useState(true)
    const { data: stats, isLoading } = useOrderStats()

    const monthlyData = stats?.monthlyRevenue || []
    const totalYearlyIncome = monthlyData.reduce((sum: number, m: { income: number }) => sum + m.income, 0)
    const platformRevenue = Math.round(totalYearlyIncome * 0.05)

    if (isLoading) {
        return (
            <Card>
                <div className="flex items-center justify-center py-20">
                    <Spin size="large" />
                </div>
            </Card>
        )
    }

    // Determine Y-axis domain dynamically
    const maxIncome = Math.max(...monthlyData.map((m: { income: number }) => m.income), 0)
    const maxOrders = Math.max(...monthlyData.map((m: { orders: number }) => m.orders), 0)
    const yMax = Math.max(maxIncome, maxOrders * 10000) * 1.2 || 1000

    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Tổng doanh thu năm nay</Text>
                    <Text style={{ fontSize: 30, fontWeight: 600 }}>{formatCurrency(totalYearlyIncome)}đ</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Phí nền tảng (5%): <Text strong style={{ color: '#1890ff' }}>{formatCurrency(platformRevenue)}đ</Text>
                    </Text>
                </div>
            </div>

            {/* Interactive Legend with Checkboxes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24, marginBottom: 16 }}>
                <Checkbox checked={showIncome} onChange={(e) => setShowIncome(e.target.checked)}>
                    Doanh thu
                </Checkbox>
                <Checkbox checked={showOrders} onChange={(e) => setShowOrders(e.target.checked)}>
                    Số đơn hàng
                </Checkbox>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        key={`${showIncome}-${showOrders}`}
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#666" }}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                if (name === 'income') return [formatCurrency(value) + 'đ', 'Doanh thu'];
                                return [value, 'Số đơn'];
                            }}
                        />
                        {showIncome && (
                            <Bar
                                dataKey="income"
                                fill="#fb923c"
                                radius={[2, 2, 0, 0]}
                                maxBarSize={40}
                                animationBegin={0}
                                animationDuration={600}
                                animationEasing="ease-out"
                            />
                        )}
                        {showOrders && (
                            <Bar
                                dataKey="orders"
                                fill="#3b82f6"
                                radius={[2, 2, 0, 0]}
                                maxBarSize={40}
                                animationBegin={0}
                                animationDuration={600}
                                animationEasing="ease-out"
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}