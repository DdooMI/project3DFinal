import { useScene } from './context/SceneContext'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import { SceneProvider } from './context/SceneContext'
import RightSidebar from './components/RightSidebar'
import LeftSidebar from './components/LeftSidebar'
import TopBar from './components/Topbar'
import Scene from './components/Scene'
import Compass, { Compass3D } from './components/Compass'
import CameraSetup from './components/CameraSetup'
import { useState, useEffect, useRef } from 'react'

function App() {

  
  
  return (
    <SceneProvider>
      <AppContent />
    </SceneProvider>
  )
}

function AppContent() {
  const { state } = useScene();
  
  

  return (
    
        <div className="h-screen w-screen relative bg-gray-100 overflow-hidden">
          {/* Full-page canvas */}
          <div className="absolute inset-0 w-full h-full">
            <Canvas camera={{ position: [0, 5, -10], fov: 75 }}>
              <CameraSetup />
              <OrbitControls 
                minPolarAngle={0.1} 
                maxPolarAngle={Math.PI / 2.05} 
                minDistance={1}
                enabled={state.isRotationEnabled}
              />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Scene />
              <Compass3D />
            </Canvas>
          </div>
          
          {/* UI elements positioned above the canvas */}
          <TopBar />
          <LeftSidebar />
          <RightSidebar />
          <Compass />
        </div>
      
  )
}

export default App