"use client";

import Box from "@/components/Box";
import LoadingSpinner from "@/components/LoadingSpinner";

const Loading = () => {
  return (
    <Box className="flex h-full w-full items-center justify-center">
      <LoadingSpinner size={40} />
    </Box>
  )
};

export default Loading;