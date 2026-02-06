'use client'
import { Card, Typography } from "antd"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"

const { Title, Text } = Typography

const chartDataBar = [
    { month: "Mo", desktop: 2 },
    { month: "Tu", desktop: 10 },
    { month: "We", desktop: 15 },
    { month: "Th", desktop: 30 },
    { month: "Fr", desktop: 50 },
    { month: "Sa", desktop: 100 },
    { month: "Su", desktop: 150 },
]

export const BarChartStatisticWeek = () => {
    return (
        <Card>
            <div style={{ marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>This Week Statistics</Title>
                <Text style={{ fontSize: 24, fontWeight: 600 }}>$7,650</Text>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartDataBar}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <Tooltip cursor={false} />
                    <Bar dataKey="desktop" fill="rgb(26, 142, 255)" radius={8} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}
