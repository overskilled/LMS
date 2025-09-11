import CourseListing from '@/components/course-list'
import React from 'react'
import MainLayout from '../main-layout'
import PublishedCourseListing from '@/components/published-courses'

const page = () => {
    return (
        <MainLayout>
            {/* <CourseListing /> */}
            <PublishedCourseListing />
        </MainLayout>
    )
}

export default page