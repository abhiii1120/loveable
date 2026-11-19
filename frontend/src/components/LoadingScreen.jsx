import { LoaderCircle } from "lucide-react";
import { Brand } from "./ui/Brand";

export const LoadingScreen = ({label = 'loading'}) => {
    return (
        <main className="grid min-h-svh place-items-center bg-background text-text-inverted">
            <div className="flex flex-col items-center gap-5">
                <Brand/>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    {label}
                </div>
            </div>
        </main>
    )
}