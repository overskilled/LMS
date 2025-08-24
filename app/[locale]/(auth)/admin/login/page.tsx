import React from 'react'
import AdminLoginForm from '../components/login-form'

const page = () => {
    return (
        <div className=' fixed flex flex-row w-full h-[100vh]'>
            <div className="flex items-center w-[60%] p-5 justify-center bg-blue-500">
                {/* image */}
            </div>
            <div className="flex items-center w-[40%] p-5 justify-center">
                <AdminLoginForm />
            </div>
        </div>
    )
}

export default page