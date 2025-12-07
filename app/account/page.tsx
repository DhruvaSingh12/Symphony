import React from "react";
import AccountContent from "./components/AccountContent";
import Header from "@/components/Header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import ListItem from "@/components/ListItem"; 
import { User } from "lucide-react";

const AccountsPage = () => {
  return (
    <div className="h-full w-full space-y-4">
      <Header className="bg-transparent">
        <div className="px-2">
          <div className="flex items-center gap-x-5">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
              <AvatarImage src="/images/accounts.png" alt="Account" />
              <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-y-2">
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Account Details
              </h1>
            </div>
          </div>
        </div>
      </Header>
      <Card className="bg-card/60 border-border mx-2 p-4">
        <AccountContent />
      </Card>
      <Card className="bg-card/60 border-border mx-2 p-4">
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-3
          xl:grid-cols-4
          2xl:grid-cols-6
          gap-3
        ">
          <ListItem 
            image="/images/privacy.png" 
            name="Privacy Policy"
            href="/privacypolicy"
          />
        </div>
      </Card>
    </div>
  );
};

export default AccountsPage;
