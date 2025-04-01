import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import compassRose from '../assets/compass-rose.svg';

// This component will be used to communicate between the 3D world and the UI
const CompassContext = React.createContext();

// This component will be rendered inside the Canvas
export const Compass3D = () => {
  // Initialize with north direction (0 radians)
  const [rotation, setRotation] = useState(0);
  
  // We'll use a ref to store the camera's quaternion
  const cameraQuaternion = useRef(new THREE.Quaternion());
  
  useEffect(() => {
    // Function to update compass rotation based on camera
    const updateCompassRotation = () => {
      if (window.mainCamera) {
        // Get the camera's quaternion
        window.mainCamera.getWorldQuaternion(cameraQuaternion.current);
        
        // Extract the camera's rotation around the Y axis (yaw)
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(cameraQuaternion.current);
        
        // Project onto XZ plane and normalize
        direction.y = 0;
        direction.normalize();
        
        // Calculate angle in radians
        // Invert the angle to fix the reversed rotation
        let angle = -Math.atan2(direction.x, direction.z);
        setRotation(angle);
        
        // Store the rotation in window for the UI component to access
        window.compassRotation = angle;
      }
    };

    // Set up an interval to check for camera changes
    const interval = setInterval(updateCompassRotation, 100);
    
    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything visible
  // It just updates the window.compassRotation value
  return null;
};

// This is the UI component that will be rendered outside the Canvas
const CompassUI = () => {
  const [rotation, setRotation] = useState(0);
  const compassRef = useRef();

  useEffect(() => {
    // Function to get the rotation from the window object
    const updateRotation = () => {
      if (window.compassRotation !== undefined) {
        setRotation(window.compassRotation);
      }
    };

    // Set up an interval to check for rotation changes
    const interval = setInterval(updateRotation, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={compassRef}
      className="absolute top-4 right-4 w-20 h-20 bg-white bg-opacity-80 rounded-full shadow-lg flex items-center justify-center z-50"
      style={{ pointerEvents: 'none' }}
    >
      <div className="relative w-18 h-18 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden">
        {/* Compass face with SVG */}
        <div className="absolute inset-0 rounded-full flex items-center justify-center">
          <img 
            src={compassRose} 
            alt="Compass Rose" 
            className="w-full h-full" 
            style={{ transform: `rotate(${rotation}rad)` }}
          />
          
          {/* Removed the red point indicator */}
        </div>
      </div>
      
      {/* Current direction indicator */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md font-mono">
        {Math.round((rotation * 180 / Math.PI) % 360)}°
      </div>
    </div>
  );
};

// Default export is the UI component
const Compass = () => {
  return <CompassUI />;
};

export default Compass;