"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
} from "recharts"
import {
    TrendingUp,
    Users,
    BookOpen,
    DollarSign,
    Target,
    MousePointer,
    Award,
    Activity,
    Calendar,
    Filter,
    Download,
    ChevronRight,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DashboardSummary,
    CoursePerformance,
    EnrollmentTrend,
    AffiliatePerformance,
    UserDistribution,
    RecentActivity
} from "@/utils/monitoringApi";
import { dashboardApi } from "@/utils/monitoringApi"

export function LMSDashboard() {
    const [loading, setLoading] = useState(true)
    const [summaryMetrics, setSummaryMetrics] = useState<DashboardSummary>({
        totalCourses: 0,
        activeEnrollments: 0,
        totalRevenue: 0,
        affiliateRevenue: 0,
        conversionRate: 0,
    });

    const [coursePerformance, setCoursePerformance] = useState<CoursePerformance[]>([]);
    const [enrollmentTrends, setEnrollmentTrends] = useState<EnrollmentTrend[]>([]);
    const [affiliatePerformance, setAffiliatePerformance] = useState<AffiliatePerformance[]>([]);
    const [userDistribution, setUserDistribution] = useState<UserDistribution>({
        students: 0,
        admins: 0,
        instructors: 0,
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [activeTab, setActiveTab] = useState("courses")

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)

                // Fetch all data in parallel
                const [
                    summaryResponse,
                    coursesResponse,
                    trendsResponse,
                    affiliatesResponse,
                    usersResponse,
                    activitiesResponse,
                ] = await Promise.all([
                    dashboardApi.getSummaryMetrics(),
                    dashboardApi.getCoursePerformance(),
                    dashboardApi.getEnrollmentTrends(),
                    dashboardApi.getAffiliatePerformance(),
                    dashboardApi.getUserDistribution(),
                    dashboardApi.getRecentActivities(),
                ])

                if (summaryResponse.data) setSummaryMetrics(summaryResponse.data)
                if (coursesResponse.data) setCoursePerformance(coursesResponse.data)
                if (trendsResponse.data) setEnrollmentTrends(trendsResponse.data)
                if (affiliatesResponse.data) setAffiliatePerformance(affiliatesResponse.data)
                if (usersResponse.data) setUserDistribution(usersResponse.data)
                if (activitiesResponse.data) setRecentActivities(activitiesResponse.data)
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-80 mt-2" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-9 w-40" />
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-lg" />
                        ))}
                    </div>

                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    // Prepare user distribution data for pie chart
    const userDistributionData = [
        { name: "Students", value: userDistribution.students, color: "#3b82f6" },
        { name: "Admins", value: userDistribution.admins, color: "#8b5cf6" },
        { name: "Instructors", value: userDistribution.instructors, color: "#06b6d4" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Super Admin Dashboard</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Monitor courses, affiliates, and user engagement
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select defaultValue="30days">
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7days">Last 7 days</SelectItem>
                                <SelectItem value="30days">Last 30 days</SelectItem>
                                <SelectItem value="90days">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                                    <p className="text-3xl font-bold">{summaryMetrics.totalCourses}</p>
                                </div>
                                <BookOpen className="w-8 h-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Active Enrollments</p>
                                    <p className="text-3xl font-bold">{summaryMetrics.activeEnrollments.toLocaleString()}</p>
                                </div>
                                <Users className="w-8 h-8 text-emerald-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                                    <p className="text-3xl font-bold">{summaryMetrics.totalRevenue.toLocaleString()} XAF</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Affiliate Revenue</p>
                                    <p className="text-3xl font-bold">{summaryMetrics.affiliateRevenue.toLocaleString()} XAF</p>
                                </div>
                                <Target className="w-8 h-8 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm font-medium">Conversion Rate</p>
                                    <p className="text-3xl font-bold">{summaryMetrics.conversionRate}%</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-cyan-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="courses" className="space-y-6" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4 lg:w-fit">
                        <TabsTrigger value="courses">Course Performance</TabsTrigger>
                        <TabsTrigger value="affiliates">Affiliate Tracking</TabsTrigger>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    </TabsList>

                    {/* Course Performance Tab */}
                    <TabsContent value="courses" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Enrollment Trends */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                        Enrollment Trends
                                    </CardTitle>
                                    <CardDescription>Monthly enrollment growth over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={enrollmentTrends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Revenue by Course */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                        Revenue by Course
                                    </CardTitle>
                                    <CardDescription>Top performing courses by revenue</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={coursePerformance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="revenue" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Course Performance Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coursePerformance.map((course, index) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Users className="w-4 h-4" />
                                                    {course.enrollments} enrolled
                                                </div>
                                            </div>
                                            <Badge variant={course.completion >= 85 ? "default" : "secondary"}>
                                                {course.completion}% complete
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Revenue Progress</span>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    ${course.revenue.toLocaleString()} / ${course.target.toLocaleString()}
                                                </span>
                                            </div>
                                            <Progress value={(course.revenue / course.target) * 100} className="h-2" />

                                            <div className="flex justify-between items-center pt-2">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Target className="w-4 h-4 text-orange-500" />
                                                    <span>{course.affiliatePercentage}% affiliate</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Affiliate Tracking Tab */}
                    <TabsContent value="affiliates" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Conversion Funnel */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MousePointer className="w-5 h-5 text-purple-600" />
                                        Clicks vs Conversions
                                    </CardTitle>
                                    <CardDescription>Affiliate performance funnel</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={affiliatePerformance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="clicks" fill="#8b5cf6" name="Clicks" />
                                            <Bar dataKey="conversions" fill="#06b6d4" name="Conversions" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Earnings Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-emerald-600" />
                                        Earnings Distribution
                                    </CardTitle>
                                    <CardDescription>Revenue share by affiliate</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadialBarChart
                                            data={affiliatePerformance.map((item, index) => ({
                                                ...item,
                                                fill: `hsl(${index * 72}, 70%, 50%)`,
                                            }))}
                                        >
                                            <RadialBar dataKey="earnings" cornerRadius={10} fill="#8884d8" />
                                            <Tooltip />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Affiliate Leaderboard */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Affiliates</CardTitle>
                                <CardDescription>Ranked by conversion rate and earnings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {affiliatePerformance.map((affiliate, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{affiliate.name}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {affiliate.clicks.toLocaleString()} clicks • {affiliate.conversions} conversions
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-emerald-600">${affiliate.earnings.toLocaleString()}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {affiliate.conversionRate.toFixed(1)}% rate
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* User Management Tab */}
                    <TabsContent value="users" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* User Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        User Distribution
                                    </CardTitle>
                                    <CardDescription>Breakdown by user roles</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={userDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {userDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* User Growth */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        User Growth
                                    </CardTitle>
                                    <CardDescription>New registrations over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={enrollmentTrends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="enrollments" stroke="#10b981" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {userDistributionData.map((userType, index) => (
                                <Card key={index}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{userType.name}</p>
                                                <p className="text-2xl font-bold">{userType.value.toLocaleString()}</p>
                                            </div>
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: userType.color + "20" }}
                                            >
                                                <Users className="w-6 h-6" style={{ color: userType.color }} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Recent Activity Tab */}
                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Recent Activity Feed
                                </CardTitle>
                                <CardDescription>Latest updates across your LMS platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivities.map((activity, index) => {
                                        const Icon = activity.type === "course" ? BookOpen :
                                            activity.type === "enrollment" ? Users :
                                                activity.type === "affiliate" ? DollarSign : Award

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{activity.title}</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}