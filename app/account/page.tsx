"use client";

import AccountContent from "./components/AccountContent";
import Header from "@/components/Header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import ListItem from "@/components/ListItem";
import { User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const AccountsPage = () => {

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none px-2 pt-2">
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
      </div>
      <div className="flex-1 overflow-hidden px-2 pb-2">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <Card className="bg-card/60 border-border">
              <AccountContent />
            </Card>
            <Card className="bg-card/60 border-border">
              <div className="p-4">
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
              </div>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AccountsPage;