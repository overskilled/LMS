'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    CalendarClock,
    Link as LinkIcon,
    DollarSign,
    History,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/firebase/config'
import MainLayout from '../main-layout'

interface CourseStat {
    courseId: string
    title: string
    thumbnail: string | null
    stats: {
        userId: string
        createdAt: number
        code: string
        clicks: number
        conversions: number
        totalEarnings: number
        updatedAt: number
    }
}

interface AggregatedStats {
    totalConversions: number
    totalEarnings: number
    totalClicks: number
    lastConversionDate: string | null
    monthlyGrowth: number
    pendingPayouts: number
    nextPayoutDate: string | null
    lastConversionBuyer: string | null
}

export default function DashboardPage() {
    const [courses, setCourses] = useState<CourseStat[]>([])
    const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, userLoading, userError] = useAuthState(auth)

    const processStatsData = (data: CourseStat[]): AggregatedStats => {
        // Calculate aggregated stats from the course data
        const totalConversions = data.reduce((sum, course) => sum + course.stats.conversions, 0)
        const totalClicks = data.reduce((sum, course) => sum + course.stats.clicks, 0)
        const totalEarnings = data.reduce((sum, course) => sum + course.stats.totalEarnings, 0)

        // Find the most recent conversion
        const coursesWithConversions = data.filter(course => course.stats.conversions > 0)
        const lastConversion = coursesWithConversions.length > 0
            ? Math.max(...coursesWithConversions.map(course => course.stats.updatedAt))
            : null

        return {
            totalConversions,
            totalEarnings,
            totalClicks,
            lastConversionDate: lastConversion ? new Date(lastConversion).toISOString() : null,
            monthlyGrowth: 0, // You'll need to implement this based on your business logic
            pendingPayouts: 0, // You'll need to implement this based on your business logic
            nextPayoutDate: null, // You'll need to implement this based on your business logic
            lastConversionBuyer: null // You'll need to implement this if you have buyer info
        }
    }

    const fetchStats = useCallback(async () => {
        if (!user) {
            setError('Authentication required')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const token = await user.getIdToken()
            const response = await fetch("/api/affiliate/stats", {
                method: "POST", 
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (!data.stats || !Array.isArray(data.stats)) {
                throw new Error('Invalid data format received from API')
            }

            setCourses(data.stats)
            setAggregatedStats(processStatsData(data.stats))

        } catch (err) {
            console.error('Failed to load stats:', err)
            setError(err instanceof Error ? err.message : 'Failed to load data')
            // toast({
            //     title: 'Error',
            //     description: 'Failed to load affiliate stats',
            //     variant: 'destructive',
            // })
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!userLoading) {
            fetchStats()
        }
    }, [fetchStats, userLoading])

    if (userLoading) {
        return <LoadingSkeleton />
    }

    if (userError) {
        return <ErrorMessage message={`Authentication Error: ${userError.message}`} />
    }

    if (!user) {
        return <ErrorMessage message="Please sign in to access the dashboard" />
    }

    if (error) {
        return (
            <ErrorMessage
                message={`Error: ${error}`}
                action={<button onClick={fetchStats} className="mt-2 text-sm text-red-700 hover:underline">Retry</button>}
            />
        )
    }

    if (!aggregatedStats || courses.length === 0) {
        return <ErrorMessage message="No data available" variant="muted" />
    }

    return (
        <MainLayout>
            <div className="flex flex-col flex-1 p-4 md:p-6">
                <h1 className="text-2xl font-bold mb-6">Earnings Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <StatCard
                        title="Total clicks"
                        value={aggregatedStats.totalClicks}
                        icon={<LinkIcon className="h-4 w-4 text-muted-foreground" />}
                        description={`Last conversion: ${aggregatedStats.lastConversionDate ? formatDistanceToNow(new Date(aggregatedStats.lastConversionDate)) : 'N/A'}`}
                    />

                    <StatCard
                        title="Total Conversions"
                        value={aggregatedStats.totalConversions}
                        icon={<History className="h-4 w-4 text-muted-foreground" />}
                        description={`Next payout: ${aggregatedStats.nextPayoutDate ? formatDistanceToNow(new Date(aggregatedStats.nextPayoutDate)) : 'N/A'}`}
                    />

                    <StatCard
                        title="Total Earnings"
                        value={`${aggregatedStats.totalEarnings.toFixed(2)} FCFA`}
                        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                        description={`${aggregatedStats.monthlyGrowth >= 0 ? '+' : ''}${aggregatedStats.monthlyGrowth}% from last month`}
                    />

                    <StatCard
                        title="Last Conversion"
                        value={aggregatedStats.lastConversionDate ? formatDistanceToNow(new Date(aggregatedStats.lastConversionDate)) : 'Never'}
                        icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
                        description={aggregatedStats.lastConversionBuyer || 'No data'}
                    />
                </div>

                <div className="flex items-center justify-center w-full my-10">
                    Affiliation cashout is coming soon 
                </div>
            </div>
        </MainLayout>
    )
}

// Helper components for better readability
function LoadingSkeleton() {
    return (
        <div className="flex flex-col flex-1 p-4 md:p-6 space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-16 mt-2" />
                            <Skeleton className="h-3 w-32 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

    )
}

interface ErrorMessageProps {
    message: string
    variant?: 'error' | 'muted'
    action?: React.ReactNode
}

function ErrorMessage({ message, variant = 'error', action }: ErrorMessageProps) {
    const className = variant === 'error'
        ? 'text-red-500 p-4 rounded-lg bg-red-50 border border-red-200'
        : 'text-muted-foreground p-4'

    return (
        <div className="flex flex-col flex-1 p-4 md:p-6">
            <div className={className}>
                <p>{message}</p>
                {action}
            </div>
        </div>
    )
}

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    description: string
}

function StatCard({ title, value, icon, description }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}