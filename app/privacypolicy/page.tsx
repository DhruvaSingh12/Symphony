"use client";

import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";

const PrivacyPolicyPage = () => {

  const handleEmailClick = () => {
    navigator.clipboard.writeText('quibblespace@gmail.com').then(() => {
      toast.success('Email address copied to clipboard');
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast.error('Failed to copy email');
    });
  };

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
        <Card className="h-full w-full overflow-hidden border-border bg-card/60">
          <div className="h-full w-full overflow-y-auto scrollbar-hide p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8 text-foreground/90">
              <div>
                <p className="leading-relaxed text-muted-foreground">
                  Welcome to Quivery! This Privacy Policy explains how I collect, use, and protect your personal information. Quivery is a personal project intended for use by family and friends.
                </p>
              </div>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Information I Collect</h2>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Name (if uploaded)</li>
                  <li>Date of Birth (if uploaded)</li>
                  <li>Gender (if uploaded)</li>
                  <li>Email Address (used for authentication purposes)</li>
                  <li>Profile Image (if uploaded)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  Additionally, authenticated users can upload music to Quivery. The identity of the user who uploads the music is stored as an ID in my Supabase storage but is not disclosed to any other users.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">How I Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                  <li><span className="font-semibold text-foreground/90">Authentication:</span> To verify your identity and grant access to the website.</li>
                  <li><span className="font-semibold text-foreground/90">Personalization:</span> To customize your experience on the site.</li>
                  <li><span className="font-semibold text-foreground/90">Music Uploads:</span> To allow authenticated users to upload music to the website. The uploaded music is available to all users, but the identity of the uploader is kept confidential.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed">
                  I do not share or disclose your personal information with any third parties. Your information is strictly used for the purposes outlined above.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  I am committed to protecting your personal information. I implement appropriate technical and organizational measures to ensure the security of your data. However, please note that no method of electronic storage or transmission over the Internet is completely secure.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Currently, users cannot update their information or delete their accounts. These features may be added in the future. If you have any concerns or questions about your data, please contact me directly.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Ownership of Uploaded Music</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All the music uploaded on Quivery is not owned by me, the developer, or the users who upload it. The ownership rights belong to the artists who created the music. Please note that Quivery does not pay royalties to these artists.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  I may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Contact Me</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact me at{" "}
                  <button
                    onClick={handleEmailClick}
                    className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                  >
                    quibblespace@gmail.com
                  </button>.
                </p>
              </section>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
