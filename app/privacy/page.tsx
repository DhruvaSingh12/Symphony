import type { Metadata } from "next";
import Header from "@/components/Header";
import PrivacyContent from "./components/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Quivery",
  description: "Learn about how Quivery handles your personal information.",
};

const PrivacyPolicyPage = () => {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="w-full px-2 md:px-0 md:pr-2 mt-2 pb-2">
        <Header className="bg-transparent">
          <div className="mb-2 flex flex-col gap-y-6">
            <h1 className="text-3xl font-semibold text-foreground">
              Privacy Policy
            </h1>
          </div>
        </Header>
      </div>

      <div className="flex-1 overflow-hidden px-2 md:px-0 md:pr-2 pb-2">
        <PrivacyContent />
      </div>
    </div>
  );
};

export default PrivacyContent;