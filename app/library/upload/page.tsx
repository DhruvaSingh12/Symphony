"use client";

import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import UploadForm from "./components/UploadForm";

const UploadPage = () => {
    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-3xl font-semibold text-foreground">
                            Upload Music
                        </h1>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <Card className="border-border h-full flex flex-col overflow-auto scrollbar-hide relative bg-card/60 p-4 md:p-6 overflow-y-auto">
                    <UploadForm />
                </Card>
            </div>
        </div>
    );
}

export default UploadPage;
