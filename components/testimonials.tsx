import Image from "next/image";

interface Testimonial {
    id: string;
    title: string;
    text: string;
    avatar: string;
    name: string;
    role: string;
    location: string;
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
];

export default function TestimonialsSection() {
    return (
        <section className="w-full bg-white font-slab py-16 md:py-20">
            <div className="container mx-auto px-4 grid lg:grid-cols-4 gap-12">
                {/* Left Content */}
                <div className="flex flex-col justify-center space-y-6">
                    <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        What
                    </h4>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl leading-snug font-extrabold relative inline-block">
                        People Say <br /> About NMD Course
                        <span className="absolute left-0 bottom-0 w-[40%] h-1 bg-yellow-400 rounded-full -mb-1"></span>
                    </h2>
                    <p className="max-w-[600px] text-sm sm:text-base text-gray-600">
                        One-stop solution for any eLearning center, online courses.
                    </p>
                </div>

                {/* Right Testimonials */}
                <div className="relative col-span-3 flex flex-col">
                    {/* ✅ Mobile: horizontal scroll, Desktop: grid */}
                    <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 gap-6 w-full">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex-none w-[85%] sm:w-[60%] snap-center bg-gray-50 rounded-xl shadow-md p-6 border border-gray-100 relative"
                            >
                                <span className="absolute top-4 right-4 text-5xl sm:text-6xl font-bold text-gray-200 opacity-70">
                                    ”
                                </span>
                                <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-4">
                                    {testimonial.title}
                                </h3>
                                <p className="text-gray-700 mb-6 text-sm sm:text-base">{testimonial.text}</p>
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={testimonial.avatar || "/placeholder.svg"}
                                        width={56}
                                        height={56}
                                        alt={testimonial.name}
                                        className="rounded-full object-cover h-14 w-14"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            /{testimonial.role}, {testimonial.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ✅ Desktop: grid layout */}
                    <div className="hidden lg:grid grid-cols-3 gap-6">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="bg-gray-50 rounded-xl shadow-md p-8 border border-gray-100 relative"
                            >
                                <span className="absolute top-4 right-4 text-6xl font-bold text-gray-200 opacity-70">
                                    ”
                                </span>
                                <h3 className="text-xl font-bold text-blue-600 mb-4">
                                    {testimonial.title}
                                </h3>
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

                    {/* Pagination Dots (Mobile Only) */}
                    <div className="flex lg:hidden gap-2 mt-6 self-center">
                        <div className="h-2 w-2 rounded-full bg-gray-700"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
