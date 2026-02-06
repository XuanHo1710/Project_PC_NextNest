'use client'

import { Bar, BarChart, ResponsiveContainer, YAxis, CartesianGrid, XAxis, Tooltip } from "recharts"
import { useState } from "react"
import { Card, Checkbox, Select, Typography } from "antd"

const { Text } = Typography

const chartDataCol = [
    { month: "Jan", income: 180, costOfSales: 120 },
    { month: "Feb", income: 90, costOfSales: 45 },
    { month: "Mar", income: 135, costOfSales: 78 },
    { month: "Apr", income: 115, costOfSales: 152 },
    { month: "May", income: 120, costOfSales: 168 },
    { month: "Jun", income: 145, costOfSales: 100 },
    { month: "Jul", income: 170, costOfSales: 180 },
    { month: "Aug", income: 200, costOfSales: 220 },
    { month: "Sep", income: 175, costOfSales: 180 },
    { month: "Oct", income: 240, costOfSales: 210 },
    { month: "Nov", income: 210, costOfSales: 220 },
    { month: "Dec", income: 180, costOfSales: 200 },
]

export const SaleChartStatistic = () => {
    const [showIncome, setShowIncome] = useState(true)
    const [showCostOfSales, setShowCostOfSales] = useState(true)

    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Net Profit</Text>
                    <Text style={{ fontSize: 30, fontWeight: 600 }}>$1560</Text>
                </div>
                <Select defaultValue="this-year" style={{ width: 120 }}>
                    <Select.Option value="this-year">This Year</Select.Option>
                    <Select.Option value="last-year">Last Year</Select.Option>
                </Select>
            </div>

            {/* Interactive Legend with Checkboxes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24, marginBottom: 16 }}>
                <Checkbox checked={showIncome} onChange={(e) => setShowIncome(e.target.checked)}>
                    Income
                </Checkbox>
                <Checkbox checked={showCostOfSales} onChange={(e) => setShowCostOfSales(e.target.checked)}>
                    Cost of Sales
                </Checkbox>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        key={`${showIncome}-${showCostOfSales}`}
                        data={chartDataCol}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#666" }}
                            domain={[0, 260]}
                            ticks={[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240]}
                        />
                        <Tooltip />
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
                        {showCostOfSales && (
                            <Bar
                                dataKey="costOfSales"
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