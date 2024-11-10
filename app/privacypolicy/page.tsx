"use client";

import React from "react";
import Header from "@/components/Header";
import Box from "@/components/Box";

const PrivacyPolicyPage = () => {
  const handleEmailClick = () => {
    navigator.clipboard.writeText('symphonyseven7@gmail.com').then(() => {
      alert('Email address copied to clipboard');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="bg-neutral-800 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <div className="w-full flex flex-col gap-y-2 bg-black h-full">
        <Box>
          <Header>
            <div className="mt-1 px-2 md:px-2">
              <h1 className="text-white text-2xl md:text-5xl lg:text-6xl font-bold">
                Privacy Policy
              </h1>
            </div>
          </Header>
        </Box>
        <Box className="overflow-y-auto flex-1 h-full p-4">
          <div className="mt-1 mb-4 text-white">
            <p className="text-purple-500"><strong>Last Updated: 31st July 2024</strong></p>
            <p>Welcome to Symphony! This Privacy Policy explains how I collect, use, and protect your personal information. Symphony is a personal project intended for use by family and friends.</p>
            
            <h2 className="text-xl font-bold text-purple-500 mt-4">Information I Collect</h2>
            <ul className="list-disc list-inside">
              <li>Name (if uploaded)</li>
              <li>Date of Birth (if uploaded)</li>
              <li>Gender (if uploaded)</li>
              <li>Email Address (used for authentication purposes)</li>
              <li>Profile Image (if uploaded)</li>
            </ul>
            <p>Additionally, authenticated users can upload music to Symphony. The identity of the user who uploads the music is stored as an ID in my Supabase storage but is not disclosed to any other users.</p>

            <h2 className="text-xl text-purple-500 font-bold mt-4">How I Use Your Information</h2>
            <ul className="list-disc list-inside">
              <li><strong>Authentication:</strong> To verify your identity and grant access to the website.</li>
              <li><strong>Personalization:</strong> To customize your experience on the site.</li>
              <li><strong>Music Uploads:</strong> To allow authenticated users to upload music to the website. The uploaded music is available to all users, but the identity of the uploader is kept confidential.</li>
            </ul>

            <h2 className="text-xl font-bold text-purple-500 mt-4">Information Sharing and Disclosure</h2>
            <p>I do not share or disclose your personal information with any third parties. Your information is strictly used for the purposes outlined above.</p>

            <h2 className="text-xl font-bold text-purple-500 mt-4">Data Security</h2>
            <p>I am committed to protecting your personal information. I implement appropriate technical and organizational measures to ensure the security of your data. However, please note that no method of electronic storage or transmission over the Internet is completely secure.</p>

            <h2 className="text-xl font-bold text-purple-500 mt-4">Your Rights</h2>
            <p>Currently, users cannot update their information or delete their accounts. These features may be added in the future. If you have any concerns or questions about your data, please contact me directly.</p>

            <h2 className="text-xl font-bold text-purple-500 mt-4">Ownership of Uploaded Music</h2>
            <p>All the music uploaded on Symphony is not owned by me, the developer, or the users who upload it. The ownership rights belong to the artists who created the music. Please note that Symphony does not pay royalties to these artists.</p>

            <h2 className="text-xl font-bold text-purple-500 mt-4">Changes to This Privacy Policy</h2>
            <p>I may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>

            <h2 className="text-xl font-bold text-purple-500 mt-4">Contact Me</h2>
            <p>If you have any questions about this Privacy Policy, please contact me at 
              <button 
                onClick={handleEmailClick} 
                className="text-blue-500 underline ml-1"
              >
                symphonyseven7@gmail.com
              </button>.
            </p>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
