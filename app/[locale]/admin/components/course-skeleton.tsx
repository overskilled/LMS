import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs"

export function CourseFormSkeleton() {
    return (
        <div className="p-6 animate-pulse">
            <Skeleton className="h-8 w-64 mb-6" />

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-4">
                    <Skeleton className="h-10 w-24 mr-2" />
                    <Skeleton className="h-10 w-24 mr-2" />
                    <Skeleton className="h-10 w-24 mr-2" />
                    <Skeleton className="h-10 w-24 mr-2" />
                    <Skeleton className="h-10 w-24" />
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pricing">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="media">
                    <Card className="mb-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-[100px] w-[200px] rounded" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-[200px] w-full rounded" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="videos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <Skeleton className="h-6 w-48" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-32" />
                                <Skeleton className="h-9 w-28" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-24 w-full rounded" />
                            <Skeleton className="h-24 w-full rounded" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-6 w-12 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-6 w-12 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    )
}
