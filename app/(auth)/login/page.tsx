import React from 'react'
import LoginForm from '../components/login-form'

const Page = () => {
    return (
        <div className="fixed flex flex-col md:flex-row w-full h-screen">
            {/* Left Section - Image or Illustration */}
            <div className="hidden md:flex items-center w-full md:w-[60%] p-5 justify-center bg-blue-500">
                {/* Add your image or illustration here */}
                {/* <img
                    src="/placeholder.svg"
                    alt="Login illustration"
                    className="max-w-[80%] h-auto object-contain"
                /> */}
            </div>

            {/* Right Section - Login Form */}
            <div className="flex items-center w-full md:w-[40%] p-5 justify-center bg-white">
                <div className="w-full max-w-md px-4 sm:px-6">
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}

export default Page
