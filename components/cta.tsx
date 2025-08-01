import React from 'react'
import { Button } from './ui/button'

const Cta = () => {
    return (
        <section className="relative overflow-hidden py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-8 bg-blue-900">
            {/* Background Glow */}
            <div className="w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] rounded-full bg-gradient-to-r from-[#58AEF1] to-blue-500 absolute -top-20 -right-20 blur-3xl opacity-10 pointer-events-none"></div>

            {/* CTA Content */}
            <div className="max-w-2xl mx-auto text-center relative">
                <div className="py-4">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-blue-100 font-bold leading-snug">
                        Get Unlimited Access To All Courses
                    </h3>
                    <p className="text-blue-300 text-sm sm:text-base md:text-lg leading-relaxed mt-3 px-2 sm:px-0">
                        Get your NMD Membership Subscription.
                    </p>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-2">
                    <Button
                        variant="secondary"
                        className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base"
                    >
                        Enroll to membership
                    </Button>
                    <Button
                        className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base"
                    >
                        Get Started
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default Cta
