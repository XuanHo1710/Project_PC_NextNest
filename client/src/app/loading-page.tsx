// "use client";

// import { Image } from "antd";
// import { PageLoadProgressBar } from "@/components/Loading";

// export default function LoadingPage() {
//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 animate-fadein">
//             {/* YouTube style loading bar at top */}
//             <PageLoadProgressBar
//                 startLoading={true}
//                 height={6}
//                 position="top"
//                 duration={1000}
//             />

//             {/* Logo with shadow */}
//             <div className="flex flex-col items-center space-y-8">
//                 <div className="relative">
//                     <Image
//                         src="https://thumbs.dreamstime.com/b/explore-sleek-computer-logo-design-vector-illustration-white-background-ideal-tech-companies-websites-digital-377542704.jpg"
//                         alt="Tech Logo"
//                         className="!w-[400px] mx-auto  rounded-none"
//                         preview={false}
//                         style={{ border: 'none', outline: 'none' }}
//                     />
//                     {/* Animated gradient spinner */}
//                     <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
//                         <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-r-transparent border-b-blue-500 border-l-blue-400 animate-spin bg-white shadow-md"></div>
//                     </div>
//                 </div>
//                 {/* Tagline with divider */}
//                 <div className="flex flex-col items-center mt-16">
//                     <div className="w-16 h-1 bg-blue-200 rounded-full mb-4" />
//                     <p className="text-base text-gray-500 tracking-wide font-medium">from <span className="font-bold text-blue-600">Nguyễn Xuân Hồ</span></p>
//                 </div>
//             </div>
//             {/* Fade-in animation */}
//             <style>{`
//                 @keyframes fadein {
//                     0% { opacity: 0; transform: scale(0.98); }
//                     100% { opacity: 1; transform: scale(1); }
//                 }
//                 .animate-fadein { animation: fadein 0.8s cubic-bezier(.4,0,.2,1) both; }
//             `}</style>
//         </div>
//     );
// }
