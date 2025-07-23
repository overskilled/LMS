import React from 'react'
import { Button } from './ui/button'

const Cta = () => {
    return (
        <section className="relative overflow-hidden py-28 px-4 bg-blue-900 md:px-8">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#58AEF1] to-blue-500 absolute -top-12 -right-14 blur-2xl opacity-10"></div>
            <div className="max-w-xl mx-auto text-center relative">
                <div className="py-4">
                    <h3 className="text-3xl text-blue-200 font-semibold md:text-4xl">
                        Get Unlimited Access To All Courses
                    </h3>
                    <p className="text-blue-300 leading-relaxed mt-3">
                        Nam erat risus, sodales sit amet lobortis ut, finibus eget metus.
                        Cras aliquam ante ut tortor posuere feugiat. Duis sodales nisi id
                        porta lacinia.
                    </p>
                </div>
                <div className="mt-5 items-center justify-center gap-3 sm:flex">
                    <Button
                        variant={"secondary"}
                    >
                        Try It Out
                    </Button>
                    <Button
                    >
                        Get Started
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default Cta