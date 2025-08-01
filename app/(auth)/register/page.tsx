import React from 'react'
import SignupForm from '../components/signup-form'

const Page = () => {
    return (
        <div className="flex flex-col md:flex-row w-full h-screen">
            {/* Left Section - Image or Illustration */}
            <div className="hidden md:flex items-center justify-center w-full md:w-[60%] p-5 bg-blue-500">
                {/* Replace with your image */}
                {/* <img
                    src="/placeholder.svg"
                    alt="Signup illustration"
                    className="max-w-[80%] h-auto object-contain"
                /> */}
            </div>

            {/* Right Section - Signup Form */}
            <div className="flex items-center w-full md:w-[40%] p-5 justify-center bg-white">
                <div className="w-full max-w-md px-4 sm:px-6">
                    <SignupForm />
                </div>
            </div>
        </div>
    )
}

export default Page
