import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

// This component stores the camera reference in the window object
// so it can be accessed by components outside the Canvas
const CameraSetup = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Store the camera reference in the window object
    window.mainCamera = camera;
    
    return () => {
      // Clean up when component unmounts
      delete window.mainCamera;
    };
  }, [camera]);
  
  // This component doesn't render anything visible
  return null;
};

export default CameraSetup;