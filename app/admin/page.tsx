"use client"

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from "next/image"
import React, { useEffect, useState } from 'react'
import HourSpent from "./components/hour-spent"
import { useRouter } from "next/navigation"

interface User {
    uid: string
    email: string
    name: string
    admin?: boolean
    createdAt: string
}

const Page = () => {

    const [userData, setUserData] = useState<User>({
        uid: "",
        email: "",
        name: "",
        createdAt: "",
    })
    const router = useRouter()


    const checkAdmin = (userData: User) => {
        if (!userData.admin) {
            router.push('/admin/login')
        }
    }

    useEffect(() => {
        const userString = localStorage.getItem('user-info');
        if (userString) {
            try {
                const parsedUser = JSON.parse(userString);
                setUserData(parsedUser);
            } catch (error) {
                console.error('Failed to parse user data', error);
            }
        }

        checkAdmin(userData)
    }, [])

    return (
        <div className='flex flex-row w-full gap-4'>
            <div className="flex w-[80%] flex-col">
                <Card className="w-full mb-6 h-[30vh] flex justify-center items-center bg-primary relative overflow-hidden">
                    {/* Background pattern */}
                    <div
                        className="absolute inset-0 bg-[url(/card-pattern.png)] bg-cover z-12 "
                        style={{
                            backgroundSize: '200px 200px' // Adjust based on your pattern size
                        }}
                    />

                    <CardContent className="w-full relative z-10"> {/* z-10 brings content above the pattern */}
                        <div className="flex w-full justify-between">
                            <div className="flex flex-col space-y-5">
                                <div className="flex flex-col space-y-2">
                                    <h2 className="font-bold text-white text-2xl">Hello, {userData?.name}</h2>
                                    <p className="text-md font-meduim text-gray-200">Let's learning something today</p>
                                </div>
                                <p className="text-lg font-meduim text-gray-200">Set your study plan and growth with community</p>
                            </div>
                            <div>
                                <Image
                                    src="/gretting-img.png"
                                    alt="greattings"
                                    width={300}
                                    height={300}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <HourSpent />
            </div>
            {/* <div className="flex w-[20%] bg-red-500">sidebar</div> */}
        </div>
    )
}

export default Page