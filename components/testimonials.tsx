import Image from "next/image"

interface Testimonial {
    id: string
    title: string
    text: string
    avatar: string
    name: string
    role: string
    location: string
}

const testimonials: Testimonial[] = [
    {
        id: "1",
        title: "Customer Support",
        text: "Very good and fast support during the week. They know what you need, exactly when you need it.",
        avatar: "https://placehold.co/600x400",
        name: "Mina Hollace",
        role: "Reporter",
        location: "London",
    },
    {
        id: "2",
        title: "Great quality!",
        text: "I wanted to place a review since their support helped me within a day or so, which is nice! Thanks and 5 stars!",
        avatar: "https://placehold.co/600x400",
        name: "Luvic Dubble",
        role: "Designer",
        location: "Manchester",
    },
    {
        id: "3",
        title: "Great quality!",
        text: "I wanted to place a review since their support helped me within a day or so, which is nice! Thanks and 5 stars!",
        avatar: "https://placehold.co/600x400",
        name: "Oliver Beddows",
        role: "Designer",
        location: "Manchester",
    },
    {
        id: "4",
        title: "Excellent Courses",
        text: "The courses are well-structured and easy to follow. I learned a lot and highly recommend EduMall!",
        avatar: "https://placehold.co/600x400",
        name: "Sarah Johnson",
        role: "Student",
        location: "New York",
    },
]

export default function TestimonialsSection() {
    return (
        <section className="flex w-[92%] mx-10 py-20 my-20 h-[80vh] items-center justify-center md:py-8 lg:py-0 bg-white font-slab">
            <div className="px-4 grid lg:grid-cols-4 gap-12 px-4 md:px-6">
                {/* Left Content */}
                <div className="flex flex-col justify-center space-y-6">
                    <h4 className="text-sm font-meduim text-gray-700">WHAT</h4>
                    <h2 className="text-2xl md:text-2xl lg:text-3xl leading-12 font-extrabold relative inline-block">
                        People Say <br /> About EduMall
                        <span className="absolute left-0 right-0 bottom-0 w-[40%] h-1 bg-yellow-400 rounded-full -mb-1"></span>
                    </h2>
                    <p className="max-w-[600px] text-sm text-gray-600 md:text-xl">
                        One-stop solution for any eLearning center, online courses. People love EduMall because they can create
                        their sites with ease here.
                    </p>
                </div>

                {/* Right Testimonial Cards */}
                <div className="relative col-span-3 flex flex-col items-center">
                    <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 gap-6 lg:gap-8 w-full">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex-none w-[calc(100%-48px)] sm:w-[calc(50%-24px)] lg:w-[calc(33.33%-24px)] xl:w-[calc(33.33%-24px)] snap-center bg-gray-50 rounded-xl shadow-md p-6 md:p-8 border border-gray-100 relative"
                            >
                                <span className="absolute top-4 right-4 text-6xl font-bold text-gray-200 opacity-70">”</span>
                                <h3 className="text-xl font-bold text-blue-600 mb-4">{testimonial.title}</h3>
                                <p className="text-gray-700 mb-6">{testimonial.text}</p>
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={testimonial.avatar || "/placeholder.svg"}
                                        width={64}
                                        height={64}
                                        alt={testimonial.name}
                                        className="rounded-full object-cover h-16 w-16"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-600">
                                            /{testimonial.role}, {testimonial.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pagination Dots */}
                    <div className="flex gap-2 mt-8">
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-700"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
