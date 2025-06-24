'use client'

import { Bar, BarChart, ResponsiveContainer, YAxis } from "recharts"
import { CartesianGrid, XAxis } from "recharts"
import {
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "antd";

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
    const [showIncome, setShowIncome] = useState(true);
    const [showCostOfSales, setShowCostOfSales] = useState(true);
    return (
        <>
            <div className="rounded-sm p-4 bg-white border-[1px] border-solid border-slate-200">
                <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Net Profit</p>
                            <p className="text-3xl font-semibold text-gray-900">$1560</p>
                        </div>
                        <Select defaultValue="this-year">
                            <Select.Option value="this-year">This Year</Select.Option>
                            <Select.Option value="last-year">Last Year</Select.Option>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Interactive Legend with Checkboxes */}
                    <div className="flex items-center justify-end gap-6">
                        <div className="flex items-center gap-2">
                            <Checkbox id="income" checked={showIncome} onCheckedChange={() => setShowIncome(!showIncome)} />
                            <label htmlFor="income" className="text-sm text-gray-700 cursor-pointer">
                                Income
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="cost-of-sales" checked={showCostOfSales} onCheckedChange={() => setShowCostOfSales(!showCostOfSales)} />
                            <label htmlFor="cost-of-sales" className="text-sm text-gray-700 cursor-pointer">
                                Cost of Sales
                            </label>
                        </div>
                    </div>
                    {/* Chart */}
                    <div className="w-full h-80 transition-all duration-300 ease-in-out">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                key={`${showIncome}-${showCostOfSales}`}
                                data={chartDataCol}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
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
                </CardContent>
            </div>
        </>
    )
}