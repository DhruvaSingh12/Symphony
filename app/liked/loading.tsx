"use client";

import Box from "@/components/Box";
import {BounceLoader} from "react-spinners";

const Loading = () => {
  return (
    <Box className="flex h-full w-full items-center justify-center">
      <BounceLoader color="#CF9FFF" size={40}/>
    </Box>
  )
};

export default Loading;