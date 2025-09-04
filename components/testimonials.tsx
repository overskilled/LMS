import { AnimatedTestimonials } from "@/components/ui/shadcn-io/animated-testimonials";
const testimonials = [
    {
        quote:
            "I led a cross-cultural team to Saint Petersburg for the finals of the 'Gazprom Neft Case Championship'... But thanks to the fully-funded space program offered to me last year by The ICT University through Nanosatellite Missions Design LTD and Dr. Ifriky TADADJEU, we knew exactly where to start.",
        name: "ESDRAS FOPA",
        designation: "CYBERSECURITY MENTOR - STEM IGNITE",
        src: "/esdras.webp",
    },
    {
        quote:
            "For the first time, a group of Cameroonian students was selected for the NASA High Altitude Balloon Program (NASA-HAB 2024) ... A huge thank you to Dr. Ifriky TADADJEU, our mentor for this program.",
        name: "ZAMO NKOLO ALYSSA L",
        designation: "COMPUTER ENGINEERING STUDENT - JFN HIGHTECH UNIVERSITY INSTITUTE.",
        src: "/alyssa.webp",
    },
    {
        quote:
            "I completed the course on Space Mission Management Tools, and I highly recommend it. Dr. Ifriky TADADJEU is an inspiring individual.",
        name: "Y. ZAINAB K",
        designation: "THERMAL ANALYSIS ENGINEER - EXPLEO GROUP, FRANCE",
        src: "/zeigab.jpg",
    },
];
export default function TestimonialsSection() {
    return <AnimatedTestimonials testimonials={testimonials} />;
}