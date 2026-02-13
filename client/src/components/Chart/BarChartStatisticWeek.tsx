'use client'
import { Card, Typography, Spin } from "antd"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useOrderStats } from "@/hooks/admin/useOrder"

const { Title, Text } = Typography

const formatCurrency = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}tr`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toLocaleString();
};

export const BarChartStatisticWeek = () => {
    const { data: stats, isLoading } = useOrderStats()

    const weeklyData = stats?.weeklyRevenue || []
    const weeklyTotal = stats?.weeklyTotal || 0

    if (isLoading) {
        return (
            <Card className="h-full">
                <div className="flex items-center justify-center py-20">
                    <Spin size="large" />
                </div>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <div style={{ marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>Doanh thu tuần này</Title>
                <Text style={{ fontSize: 24, fontWeight: 600 }}>{formatCurrency(weeklyTotal)}đ</Text>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <Tooltip
                        formatter={(value: number) => [formatCurrency(value) + 'đ', 'Doanh thu']}
                        cursor={false}
                    />
                    <Bar dataKey="revenue" fill="rgb(26, 142, 255)" radius={8} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}
