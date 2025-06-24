'use client'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"


const chartDataBar = [
    { month: "Mo", desktop: 2 },
    { month: "Tu", desktop: 10 },
    { month: "We", desktop: 15 },
    { month: "Th", desktop: 30 },
    { month: "Fr", desktop: 50 },
    { month: "Sa", desktop: 100 },
    { month: "Su", desktop: 150 },
]

const chartConfigBar = {
    desktop: {
        label: "Desktop",
        color: "rgb(26, 142, 255)",
    },
} satisfies ChartConfig

export const BarChartStatisticWeek = () => {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>This Week Statistics</CardTitle>
                    <CardDescription className="text-2xl">$7,650</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigBar}>
                        <BarChart accessibilityLayer data={chartDataBar}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </>
    )
}

