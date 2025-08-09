'use client'

import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { CalendarClock, Link as LinkIcon, DollarSign, History } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { useAffiliateStats } from '@/hooks/useAffiliateStats'
import MainLayout from '../main-layout'

export default function DashboardPage() {
    const { stats, loading, error, user } = useAffiliateStats()

    if (loading) {
        return <LoadingSkeleton />
    }

    if (!user) {
        return <ErrorMessage message="Please sign in to access the dashboard" />
    }

    if (error) {
        return (
            <ErrorMessage
                message={`Error: ${error}`}
                action={
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-red-700 hover:underline"
                    >
                        Retry
                    </button>
                }
            />
        )
    }

    if (!stats) {
        return <ErrorMessage message="No data available" variant="muted" />
    }

    return (
        <MainLayout>
            <div className="flex flex-col flex-1 p-4 md:p-6">
                <h1 className="text-2xl font-bold mb-6">Earnings Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <StatCard
                        title="Total clicks"
                        value={stats.totalClicks}
                        icon={<LinkIcon className="h-4 w-4 text-muted-foreground" />}
                        description={
                            stats.lastConversionDate
                                ? `Last conversion: ${formatDistanceToNow(
                                    new Date(stats.lastConversionDate)
                                )}`
                                : 'No conversions yet'
                        }
                    />

                    <StatCard
                        title="Total Conversions"
                        value={stats.totalConversions}
                        icon={<History className="h-4 w-4 text-muted-foreground" />}
                        description="All-time"
                    />

                    <StatCard
                        title="Total Earnings"
                        value={`${stats.totalEarnings.toFixed(2)} FCFA`}
                        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                        description="All-time"
                    />

                    <StatCard
                        title="Last Conversion"
                        value={
                            stats.lastConversionDate
                                ? formatDistanceToNow(new Date(stats.lastConversionDate))
                                : 'Never'
                        }
                        icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
                        description="Relative to now"
                    />
                </div>

                <div className="flex items-center justify-center w-full my-10">
                    Affiliation cashout is coming soon
                </div>
            </div>
        </MainLayout>
    )
}

function StatCard({
    title,
    value,
    icon,
    description,
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    description?: string
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    )
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col flex-1 p-4 md:p-6 space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function ErrorMessage({
    message,
    variant = 'error',
    action,
}: {
    message: string
    variant?: 'error' | 'muted'
    action?: React.ReactNode
}) {
    const colors =
        variant === 'error'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-gray-50 text-gray-700 border-gray-200'
    return (
        <div
            className={`flex flex-col items-center justify-center p-6 border rounded-md ${colors}`}
        >
            <p>{message}</p>
            {action}
        </div>
    )
}
