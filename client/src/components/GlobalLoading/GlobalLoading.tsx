// "use client";
// import { useEffect, useState } from "react";
// import { usePathname } from "next/navigation";
// import { PageLoadProgressBar } from "@/components/Loading";

// export default function GlobalLoading({ children }: { children: React.ReactNode }) {
//     const [loading, setLoading] = useState(false);
//     const pathname = usePathname();

//     useEffect(() => {
//         setLoading(true);
//         const timeout = setTimeout(() => setLoading(false), 800); // fake delay cho mượt
//         return () => clearTimeout(timeout);
//     }, [pathname]);

//     return (
//         <>
//             {/* <PageLoadProgressBar
//                 startLoading={loading}
//                 height={6}
//                 position="header-bottom"
//                 duration={800}
//             /> */}
//             {children}
//         </>
//     );
// }
