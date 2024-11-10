import React from "react";
import Button from "@/components/Button";
import { FaUser, FaBirthdayCake, FaTransgender, FaImage } from "react-icons/fa";

interface DetailsFormProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (value: string) => void;
  setImage: (file: File | null) => void;
  handleSave: () => void;
}

const DetailsForm: React.FC<DetailsFormProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  setImage,
  handleSave,
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <FaUser className="text-gray-300" />
        <input
          type="text"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <FaUser className="text-gray-300" />
        <input
          type="text"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <FaTransgender className="text-gray-300" />
        <select
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <FaBirthdayCake className="text-gray-300" />
        <input
          type="date"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <FaImage className="text-gray-300" />
        <input
          type="file"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      <Button
        onClick={handleSave}
        className="bg-blue-600 text-white rounded-full px-6 py-2"
      >
        Save
      </Button>
    </div>
  );
};

export default DetailsForm;
