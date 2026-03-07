module.exports = [
"[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/node_modules/next/link.js [ssr] (ecmascript)");
"use client";
;
;
;
function Navbar() {
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const handleScroll = ()=>setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, {
            passive: true
        });
        return ()=>window.removeEventListener("scroll", handleScroll);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
        className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#fefdf9]/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm" : "bg-transparent"}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "flex items-center gap-2.5 group",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                        src: "/quiclab.svg",
                        alt: "Quiclab Logo",
                        className: "h-8"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                    className: "hidden md:flex items-center gap-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                            href: "#products",
                            className: "text-sm text-stone-500 hover:text-stone-900 transition-colors duration-150",
                            children: "Products"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                            href: "#why",
                            className: "text-sm text-stone-500 hover:text-stone-900 transition-colors duration-150",
                            children: "Why Quiclab"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                    href: "#products",
                    className: "hidden md:inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-150 shadow-sm",
                    children: [
                        "Explore Tools",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                            width: "14",
                            height: "14",
                            viewBox: "0 0 14 14",
                            fill: "none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                d: "M2.5 7H11.5M7.5 3L11.5 7L7.5 11",
                                stroke: "currentColor",
                                strokeWidth: "1.5",
                                strokeLinecap: "round",
                                strokeLinejoin: "round"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
                                lineNumber: 52,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Hero
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function Hero() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "relative min-h-screen flex items-center overflow-hidden pt-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 overflow-hidden pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary-100 to-primary-50 opacity-60 blur-3xl"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                        lineNumber: 7,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-amber-100 to-transparent opacity-40 blur-2xl"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                        lineNumber: 9,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 opacity-[0.025]",
                        style: {
                            backgroundImage: `radial-gradient(circle, #0f0e0c 1px, transparent 1px)`,
                            backgroundSize: "40px 40px"
                        }
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                        lineNumber: 11,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                lineNumber: 5,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "relative max-w-6xl mx-auto px-5 sm:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-primary-100 border border-primary-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                        lineNumber: 25,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-primary-700 tracking-wide uppercase",
                                        children: "Tools for Makers"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                        lineNumber: 26,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                lineNumber: 24,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                className: "font-display text-5xl sm:text-6xl lg:text-7xl text-stone-900 leading-[1.05] mb-6",
                                children: [
                                    "Build faster.",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "italic text-primary-500",
                                        children: "Create"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                        lineNumber: 34,
                                        columnNumber: 13
                                    }, this),
                                    " ",
                                    "better."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: "text-lg sm:text-xl text-stone-500 leading-relaxed mb-10 max-w-lg",
                                children: "Quiclab builds lightweight productivity tools designed for creators and developers who refuse to waste time on repetitive work."
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "#products",
                                        className: "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-stone-900 text-white font-medium hover:bg-primary-500 transition-all duration-200 shadow-md hover:shadow-primary-200 hover:-translate-y-0.5",
                                        children: [
                                            "Explore Tools",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                width: "16",
                                                height: "16",
                                                viewBox: "0 0 16 16",
                                                fill: "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                    d: "M3 8H13M8.5 3.5L13 8L8.5 12.5",
                                                    stroke: "currentColor",
                                                    strokeWidth: "1.5",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round"
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                    lineNumber: 52,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                lineNumber: 51,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "#why",
                                        className: "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-stone-200 text-stone-700 font-medium hover:border-stone-400 hover:bg-stone-50 transition-all duration-200",
                                        children: "Why Quiclab"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                        lineNumber: 55,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "mt-10 flex items-center gap-4 text-sm text-stone-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex -space-x-2",
                                        children: [
                                            "#f97316",
                                            "#16a34a",
                                            "#7c3aed",
                                            "#0284c7"
                                        ].map((color, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "w-7 h-7 rounded-full border-2 border-[#fefdf9] flex items-center justify-center text-white text-[10px] font-bold",
                                                style: {
                                                    backgroundColor: color
                                                },
                                                children: [
                                                    "A",
                                                    "B",
                                                    "C",
                                                    "D"
                                                ][i]
                                            }, i, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                lineNumber: 67,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                        lineNumber: 65,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                className: "text-stone-700",
                                                children: "4,000+"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                lineNumber: 77,
                                                columnNumber: 15
                                            }, this),
                                            " downloads across all tools"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "relative flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "relative w-full max-w-md mx-auto animate-[float_6s_ease-in-out_infinite]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "relative bg-white rounded-3xl shadow-2xl shadow-stone-200 p-8 border border-stone-100",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "w-3 h-3 rounded-full bg-red-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                            lineNumber: 90,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "w-3 h-3 rounded-full bg-yellow-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                            lineNumber: 91,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "w-3 h-3 rounded-full bg-green-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                            lineNumber: 92,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                    lineNumber: 89,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "w-24 h-2 rounded-full bg-stone-100"
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                    lineNumber: 94,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                            lineNumber: 88,
                                            columnNumber: 15
                                        }, this),
                                        [
                                            {
                                                w: "w-full",
                                                color: "bg-primary-100",
                                                accent: true
                                            },
                                            {
                                                w: "w-4/5",
                                                color: "bg-stone-100",
                                                accent: false
                                            },
                                            {
                                                w: "w-3/4",
                                                color: "bg-stone-100",
                                                accent: false
                                            },
                                            {
                                                w: "w-5/6",
                                                color: "bg-stone-100",
                                                accent: false
                                            }
                                        ].map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3 mb-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: `h-2.5 rounded-full ${row.w} ${row.color} ${row.accent ? "opacity-100" : "opacity-60"}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                        lineNumber: 105,
                                                        columnNumber: 19
                                                    }, this),
                                                    row.accent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: "shrink-0 px-2 py-0.5 rounded-full bg-primary-500 text-white text-[9px] font-bold",
                                                        children: "AUTO"
                                                    }, void 0, false, {
                                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                        lineNumber: 109,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, i, true, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                lineNumber: 104,
                                                columnNumber: 17
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "mt-6 h-9 rounded-xl bg-primary-500 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "w-20 h-2 rounded-full bg-white opacity-90"
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                lineNumber: 118,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                            lineNumber: 117,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg shadow-stone-200 px-4 py-2.5 border border-stone-100",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-[11px] text-stone-400 mb-0.5",
                                            children: "Downloads"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                            lineNumber: 124,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-lg font-display text-stone-900",
                                            children: [
                                                "4,000",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    className: "text-primary-500",
                                                    children: "+"
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                                    lineNumber: 125,
                                                    columnNumber: 73
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                            lineNumber: 125,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg shadow-stone-200 px-4 py-2.5 border border-stone-100",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-[11px] text-stone-400 mb-0.5",
                                            children: "Products"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-lg font-display text-stone-900",
                                            children: "3 Tools"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/jdip19.github.io/components/data.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "products",
    ()=>products,
    "whyPoints",
    ()=>whyPoints
]);
const products = [
    {
        id: "quictext",
        name: "QuicText",
        tagline: "Text Automation for Figma",
        description: "Supercharge your Figma workflow with powerful text automation and formatting — rename layers, replace dummy text, and apply rules in bulk.",
        badge: "Freemium",
        downloads: "2,300+",
        ctaLabel: "Get QuicText",
        ctaHref: "#",
        iconColor: "#f97316",
        accentBg: "bg-primary-50",
        icon: "text"
    },
    {
        id: "i2snatcher",
        name: "I2Snatcher",
        tagline: "Fast WebP Image Converter",
        description: "Convert images to WebP in seconds. Drag, drop, and download — no fuss, no accounts, no waiting. Built for designers and developers who value their time.",
        badge: "Free",
        downloads: "1,100+",
        ctaLabel: "Try I2Snatcher",
        ctaHref: "#",
        iconColor: "#16a34a",
        accentBg: "bg-green-50",
        icon: "image"
    },
    {
        id: "quicdata",
        name: "QuicData",
        tagline: "Data Transformation & Automation",
        description: "Transform, clean, and automate your data pipelines without heavy tooling. Lightweight yet powerful enough for real-world workflows.",
        badge: "Freemium",
        downloads: "650+",
        ctaLabel: "Explore QuicData",
        ctaHref: "#",
        iconColor: "#7c3aed",
        accentBg: "bg-violet-50",
        icon: "data"
    }
];
const whyPoints = [
    {
        id: "lightweight",
        icon: "bolt",
        title: "Built Lean, Ships Fast",
        description: "Every Quiclab tool is purpose-built to do one thing exceptionally well. No bloat, no steep learning curves — just results."
    },
    {
        id: "creators",
        icon: "sparkle",
        title: "Made for Makers",
        description: "Whether you design in Figma, code for the web, or wrangle data — our tools slot into your existing workflow without disruption."
    },
    {
        id: "open",
        icon: "heart",
        title: "Free First, Always",
        description: "Our core features are free forever. We believe great tools shouldn't be locked behind paywalls. Upgrade only if you want more."
    }
];
}),
"[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function ProductIcon({ icon, color }) {
    if (icon === "text") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            width: "28",
            height: "28",
            viewBox: "0 0 28 28",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                    d: "M4 6H24M4 10H16M4 14H20M4 18H13",
                    stroke: color,
                    strokeWidth: "2",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 7,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                    cx: "21",
                    cy: "18",
                    r: "4",
                    fill: color,
                    fillOpacity: "0.15",
                    stroke: color,
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 8,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                    d: "M21 16.5V19.5M19.5 18H22.5",
                    stroke: color,
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 9,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
            lineNumber: 6,
            columnNumber: 7
        }, this);
    }
    if (icon === "image") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            width: "28",
            height: "28",
            viewBox: "0 0 28 28",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                    x: "3",
                    y: "5",
                    width: "22",
                    height: "18",
                    rx: "3",
                    stroke: color,
                    strokeWidth: "1.5",
                    fill: `${color}18`
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 16,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                    cx: "9",
                    cy: "11",
                    r: "2",
                    fill: color
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                    d: "M3 19L9 13L13 17L17 13L25 21",
                    stroke: color,
                    strokeWidth: "1.5",
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
            lineNumber: 15,
            columnNumber: 7
        }, this);
    }
    if (icon === "data") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            width: "28",
            height: "28",
            viewBox: "0 0 28 28",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                    x: "3",
                    y: "5",
                    width: "10",
                    height: "7",
                    rx: "2",
                    stroke: color,
                    strokeWidth: "1.5",
                    fill: `${color}18`
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                    x: "15",
                    y: "5",
                    width: "10",
                    height: "7",
                    rx: "2",
                    stroke: color,
                    strokeWidth: "1.5",
                    fill: `${color}18`
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                    x: "9",
                    y: "16",
                    width: "10",
                    height: "7",
                    rx: "2",
                    stroke: color,
                    strokeWidth: "1.5",
                    fill: color,
                    fillOpacity: "0.2"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                    d: "M8 12L8 16M20 12L20 16M14 16L14 19",
                    stroke: color,
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this);
    }
    return null;
}
function Badge({ type }) {
    const styles = {
        Free: "bg-emerald-100 text-emerald-700 border-emerald-200",
        Freemium: "bg-primary-100 text-primary-700 border-primary-200",
        Pro: "bg-violet-100 text-violet-700 border-violet-200"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase ${styles[type]}`,
        children: type
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
function ProductCard({ product }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("article", {
        className: "group relative bg-white rounded-3xl border border-stone-200 p-8 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-100 hover:-translate-y-1 transition-all duration-300 flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: `w-14 h-14 rounded-2xl ${product.accentBg} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ProductIcon, {
                    icon: product.icon,
                    color: product.iconColor
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        className: "font-display text-2xl text-stone-900",
                        children: product.name
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Badge, {
                        type: product.badge
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium text-stone-400 mb-3 tracking-wide",
                children: product.tagline
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "text-stone-600 leading-relaxed text-[15px] mb-8 flex-1",
                children: product.description
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mt-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 text-sm text-stone-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                width: "14",
                                height: "14",
                                viewBox: "0 0 14 14",
                                fill: "none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                        d: "M7 1V9M7 9L4 6M7 9L10 6",
                                        stroke: "currentColor",
                                        strokeWidth: "1.5",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                                        lineNumber: 77,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                        d: "M2 11H12",
                                        stroke: "currentColor",
                                        strokeWidth: "1.5",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                                        lineNumber: 78,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                        className: "text-stone-600 font-semibold",
                                        children: product.downloads
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                                        lineNumber: 81,
                                        columnNumber: 13
                                    }, this),
                                    " downloads"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                        href: product.ctaHref,
                        className: "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm",
                        style: {
                            backgroundColor: product.iconColor
                        },
                        "aria-label": `${product.ctaLabel} — ${product.name}`,
                        children: [
                            product.ctaLabel,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                width: "13",
                                height: "13",
                                viewBox: "0 0 13 13",
                                fill: "none",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                    d: "M2 6.5H11M7 2.5L11 6.5L7 10.5",
                                    stroke: "currentColor",
                                    strokeWidth: "1.5",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "absolute bottom-0 left-8 right-8 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                style: {
                    backgroundColor: product.iconColor
                }
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Products
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$data$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/data.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$ProductCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/ProductCard.tsx [ssr] (ecmascript)");
;
;
;
function Products() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        id: "products",
        className: "py-24 sm:py-32",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-5 sm:px-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "max-w-2xl mb-16",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-stone-500 tracking-wide uppercase",
                                children: "Our Products"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
                                lineNumber: 11,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
                            lineNumber: 10,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                            className: "font-display text-4xl sm:text-5xl text-stone-900 mb-4 leading-tight",
                            children: [
                                "Tools you'll actually",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("em", {
                                    className: "text-primary-500 not-italic",
                                    children: "use"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
                                    lineNumber: 17,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
                            lineNumber: 15,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: "text-stone-500 text-lg leading-relaxed",
                            children: "No subscription bundles. No feature bloat. Each tool is built for one job — and does it exceptionally well."
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
                    lineNumber: 9,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$data$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["products"].map((product)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$ProductCard$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            product: product
                        }, product.id, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
                            lineNumber: 28,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
            lineNumber: 7,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Why
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$data$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/data.ts [ssr] (ecmascript)");
;
;
function Icon({ type }) {
    if (type === "bolt") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            width: "22",
            height: "22",
            viewBox: "0 0 22 22",
            fill: "none",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M13 2L4 13H11L9 20L18 9H11L13 2Z",
                stroke: "#f97316",
                strokeWidth: "1.5",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                fill: "#f9731620"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                lineNumber: 7,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
            lineNumber: 6,
            columnNumber: 7
        }, this);
    }
    if (type === "sparkle") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            width: "22",
            height: "22",
            viewBox: "0 0 22 22",
            fill: "none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                    d: "M11 2V6M11 16V20M2 11H6M16 11H20M4.93 4.93L7.76 7.76M14.24 14.24L17.07 17.07M17.07 4.93L14.24 7.76M7.76 14.24L4.93 17.07",
                    stroke: "#f97316",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                    cx: "11",
                    cy: "11",
                    r: "3",
                    fill: "#f9731620",
                    stroke: "#f97316",
                    strokeWidth: "1.5"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this);
    }
    if (type === "heart") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
            width: "22",
            height: "22",
            viewBox: "0 0 22 22",
            fill: "none",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                d: "M11 19C11 19 3 14 3 8C3 5.8 4.8 4 7 4C8.5 4 9.8 4.8 10.5 6L11 7L11.5 6C12.2 4.8 13.5 4 15 4C17.2 4 19 5.8 19 8C19 14 11 19 11 19Z",
                stroke: "#f97316",
                strokeWidth: "1.5",
                strokeLinejoin: "round",
                fill: "#f9731620"
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                lineNumber: 22,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this);
    }
    return null;
}
function Why() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        id: "why",
        className: "py-24 sm:py-32 bg-stone-900",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-5 sm:px-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "text-center max-w-2xl mx-auto mb-16",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-stone-400 tracking-wide uppercase",
                                children: "Why Quiclab"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                            className: "font-display text-4xl sm:text-5xl text-white mb-4 leading-tight",
                            children: [
                                "Opinionated by",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("em", {
                                    className: "text-primary-400 not-italic",
                                    children: "design"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                                    lineNumber: 42,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                            lineNumber: 40,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: "text-stone-400 text-lg leading-relaxed",
                            children: "We build tools the way we'd want to use them ourselves — fast, focused, and free to start."
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "grid md:grid-cols-3 gap-8",
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$data$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["whyPoints"].map((point, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "relative bg-stone-800 rounded-3xl p-8 border border-stone-700 hover:border-primary-500/40 hover:bg-stone-800/80 transition-all duration-300 group",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "absolute top-8 right-8 font-display text-5xl text-stone-700 group-hover:text-stone-600 transition-colors duration-300 select-none",
                                    children: [
                                        "0",
                                        i + 1
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                                    lineNumber: 58,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "w-11 h-11 rounded-xl bg-stone-700 flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors duration-300",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Icon, {
                                        type: point.icon
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                                        lineNumber: 64,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                                    lineNumber: 63,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                    className: "font-display text-xl text-white mb-3",
                                    children: point.title
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                                    lineNumber: 67,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-stone-400 leading-relaxed text-[15px]",
                                    children: point.description
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                                    lineNumber: 68,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, point.id, true, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                            lineNumber: 53,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CTA
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function CTA() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
        className: "py-24 sm:py-32",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-5 sm:px-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-primary-600 p-12 sm:p-16 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 overflow-hidden pointer-events-none",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white opacity-5 blur-2xl"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                lineNumber: 8,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-primary-400 opacity-30 blur-2xl"
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                lineNumber: 9,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 opacity-[0.04]",
                                style: {
                                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                                    backgroundSize: "32px 32px"
                                }
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                lineNumber: 10,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                        lineNumber: 7,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                className: "font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight",
                                children: [
                                    "Ready to move",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("em", {
                                        className: "not-italic",
                                        children: "quicker?"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                        lineNumber: 22,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                lineNumber: 20,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: "text-primary-100 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed",
                                children: "Join thousands of creators and developers already using Quiclab tools to eliminate repetitive work and ship faster."
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                lineNumber: 24,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row gap-3 justify-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "#products",
                                        className: "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-primary-600 font-semibold text-base hover:bg-primary-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5",
                                        children: [
                                            "Explore All Tools",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                width: "16",
                                                height: "16",
                                                viewBox: "0 0 16 16",
                                                fill: "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                    d: "M3 8H13M8.5 3.5L13 8L8.5 12.5",
                                                    stroke: "currentColor",
                                                    strokeWidth: "1.5",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round"
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                                    lineNumber: 35,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                                lineNumber: 34,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                        lineNumber: 29,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "#why",
                                        className: "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200",
                                        children: "Learn More"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                        lineNumber: 38,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                lineNumber: 28,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "mt-14 pt-10 border-t border-white/20 grid grid-cols-3 gap-8 max-w-lg mx-auto",
                                children: [
                                    {
                                        label: "Total Downloads",
                                        value: "4,000+"
                                    },
                                    {
                                        label: "Products",
                                        value: "3 Tools"
                                    },
                                    {
                                        label: "Cost to Start",
                                        value: "$0"
                                    }
                                ].map((stat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "font-display text-3xl text-white mb-1",
                                                children: stat.value
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                                lineNumber: 54,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "text-primary-200 text-xs tracking-wide",
                                                children: stat.label
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                                lineNumber: 55,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, stat.label, true, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                        lineNumber: 53,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
                lineNumber: 5,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
            lineNumber: 4,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Footer
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/node_modules/next/link.js [ssr] (ecmascript)");
;
;
const footerLinks = {
    Products: [
        {
            label: "QuicText",
            href: "#"
        },
        {
            label: "I2Snatcher",
            href: "#"
        },
        {
            label: "QuicData",
            href: "#"
        }
    ],
    Company: [
        {
            label: "About",
            href: "#"
        },
        {
            label: "Blog",
            href: "#"
        },
        {
            label: "Changelog",
            href: "#"
        }
    ],
    Legal: [
        {
            label: "Privacy Policy",
            href: "#"
        },
        {
            label: "Terms of Service",
            href: "#"
        }
    ]
};
function Footer() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("footer", {
        className: "border-t border-stone-200 bg-[#fefdf9]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-5 sm:px-8 py-16",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "lg:col-span-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "flex items-center gap-2.5 mb-4 w-fit",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                                src: "/quiclab.svg",
                                                alt: "Quiclab Logo",
                                                className: ""
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                                lineNumber: 29,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                            lineNumber: 28,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                            className: "font-display text-xl text-stone-900",
                                            children: "Quiclab"
                                        }, void 0, false, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                            lineNumber: 31,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                    lineNumber: 27,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-stone-500 text-sm leading-relaxed max-w-[220px]",
                                    children: "Lightweight productivity tools for creators and developers."
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                    lineNumber: 33,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex gap-3 mt-6",
                                    children: [
                                        {
                                            label: "Twitter / X",
                                            href: "https://twitter.com/quiclab",
                                            path: "M4 4L10 10M10 4L4 10",
                                            viewBox: "0 0 14 14"
                                        },
                                        {
                                            label: "GitHub",
                                            href: "https://github.com/quiclab",
                                            path: "M7 2C4.24 2 2 4.24 2 7C2 9.2 3.4 11.07 5.37 11.73C5.62 11.78 5.71 11.63 5.71 11.49C5.71 11.36 5.71 10.98 5.71 10.49C4.34 10.79 4.05 9.85 4.05 9.85C3.82 9.27 3.49 9.12 3.49 9.12C3.03 8.81 3.52 8.82 3.52 8.82C4.02 8.85 4.29 9.33 4.29 9.33C4.74 10.1 5.44 9.87 5.73 9.73C5.78 9.41 5.91 9.18 6.05 9.06C4.95 8.93 3.79 8.51 3.79 6.63C3.79 6.08 3.99 5.63 4.3 5.28C4.25 5.15 4.07 4.64 4.35 3.94C4.35 3.94 4.77 3.8 5.71 4.46C6.1 4.35 6.55 4.3 7 4.3C7.45 4.3 7.9 4.35 8.29 4.46C9.23 3.8 9.65 3.94 9.65 3.94C9.93 4.64 9.75 5.15 9.7 5.28C10.01 5.63 10.21 6.08 10.21 6.63C10.21 8.52 9.04 8.93 7.94 9.06C8.11 9.21 8.27 9.52 8.27 9.99C8.27 10.68 8.27 11.24 8.27 11.49C8.27 11.63 8.36 11.78 8.62 11.73C10.59 11.07 12 9.2 12 7C12 4.24 9.76 2 7 2Z",
                                            viewBox: "0 0 14 14"
                                        }
                                    ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                            href: s.href,
                                            "aria-label": s.label,
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            className: "w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all duration-150",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                width: "14",
                                                height: "14",
                                                viewBox: s.viewBox,
                                                fill: "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                    d: s.path,
                                                    stroke: "currentColor",
                                                    strokeWidth: "1.5",
                                                    strokeLinecap: "round"
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                                    lineNumber: 61,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                                lineNumber: 60,
                                                columnNumber: 19
                                            }, this)
                                        }, s.label, false, {
                                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                            lineNumber: 52,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                    lineNumber: 37,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this),
                        Object.entries(footerLinks).map(([title, links])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                        className: "text-xs font-semibold text-stone-400 uppercase tracking-widest mb-5",
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                        lineNumber: 71,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                                        className: "space-y-3",
                                        children: links.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                                    href: link.href,
                                                    className: "text-sm text-stone-600 hover:text-stone-900 transition-colors duration-150",
                                                    children: link.label
                                                }, void 0, false, {
                                                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                                    lineNumber: 77,
                                                    columnNumber: 21
                                                }, this)
                                            }, link.label, false, {
                                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                                lineNumber: 76,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                        lineNumber: 74,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, title, true, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: [
                                "© ",
                                new Date().getFullYear(),
                                " Quiclab. All rights reserved."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: "Built with ♥ for humans"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Navbar$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/Navbar.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Hero$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/Hero.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Products$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/Products.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Why$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/Why.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$CTA$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/CTA.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Footer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/jdip19.github.io/components/Footer.tsx [ssr] (ecmascript)");
;
;
;
;
;
;
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                        children: "Quiclab — Lightweight Tools for Creators & Developers"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "description",
                        content: "Quiclab builds lightweight productivity tools for creators and developers. Try QuicText, I2Snatcher, and QuicData — free and freemium tools trusted by thousands."
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 14,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "keywords",
                        content: "productivity tools, developer tools, Figma plugin, QuicText, I2Snatcher, QuicData"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:title",
                        content: "Quiclab — Lightweight Tools for Creators & Developers"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:description",
                        content: "Lightweight productivity tools for creators and developers. Free & Freemium."
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:image",
                        content: "/og-image.png"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:url",
                        content: "https://quiclab.com"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:type",
                        content: "website"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        property: "og:site_name",
                        content: "Quiclab"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:card",
                        content: "summary_large_image"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:title",
                        content: "Quiclab — Lightweight Tools for Creators & Developers"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:description",
                        content: "Lightweight productivity tools for creators and developers."
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("meta", {
                        name: "twitter:image",
                        content: "/og-image.png"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                        rel: "icon",
                        href: "/favicon.svg",
                        type: "image/svg+xml"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("script", {
                        type: "application/ld+json",
                        dangerouslySetInnerHTML: {
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "Organization",
                                name: "Quiclab",
                                url: "https://quiclab.com",
                                description: "Quiclab builds lightweight productivity tools for creators and developers."
                            })
                        }
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "grain",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Navbar$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Hero$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Products$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Why$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$CTA$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$jdip19$2e$github$2e$io$2f$components$2f$Footer$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/jdip19.github.io/pages/index.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a83643b5._.js.map