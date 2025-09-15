import React from "react";

export type ButtonPosition = "left" | "right";

export default function Button({ name, icons, position }: { name: string, icons: React.ReactNode, position: ButtonPosition }) {
    return <>
        {
            position === "left" ? <button className="rounded-lg flex items-center justify-center gap-3 py-2 px-5 bg-red-200 text-white font-semibold cursor-pointer hover:bg-red-700">
                {icons} {name}
            </button> : <button className="rounded-lg flex items-center justify-center gap-3 py-2 px-5 bg-red-200 text-white font-semibold cursor-pointer hover:bg-red-700">
                {name} {icons}
            </button>
        }



    </>
}

