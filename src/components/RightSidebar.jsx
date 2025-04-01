import { useScene } from '../context/SceneContext';
import { useState, useEffect, useRef } from 'react';
import useStore from '../store';
import * as THREE from 'three';

const shapes = [
  { id: 'wall', name: 'Wall', icon: '▭' },
  { id: 'floor', name: 'Floor', icon: '▢' },
]

export default function RightSidebar() {
  const { state, dispatch } = useScene();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDimensionsPanel, setShowDimensionsPanel] = useState(false);
  const [showShapesPanel, setShowShapesPanel] = useState(false);
  const [isRotationEnabled, setIsRotationEnabled] = useState(state.isRotationEnabled);

  useEffect(() => {
    setIsRotationEnabled(state.isRotationEnabled);
  }, [state.isRotationEnabled]);

  const handleRotationToggle = () => {
    dispatch({
      type: 'TOGGLE_ROTATION'
    });
  };

  // Refs for all tool buttons
  const dimensionsButtonRef = useRef(null);
  const colorButtonRef = useRef(null);
  const shapesButtonRef = useRef(null);
  // Ref for the container that needs scrolling
  const toolbarContainerRef = useRef(null);

  // Function to handle panel toggles - ensures only one panel is open at a time
  const togglePanel = (panel) => {
    // Check if the clicked panel is already open
    const isClickedPanelOpen =
      (panel === 'color' && showColorPicker) ||
      (panel === 'dimensions' && showDimensionsPanel) ||
      (panel === 'shapes' && showShapesPanel);

    // Close all panels
    setShowColorPicker(false);
    setShowDimensionsPanel(false);
    setShowShapesPanel(false);

    // Only open the selected panel if it wasn't already open
    if (!isClickedPanelOpen) {
      switch (panel) {
        case 'color':
          setShowColorPicker(true);
          // Scroll to the color button
          setTimeout(() => {
            if (colorButtonRef.current) {
              colorButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 100);
          break;
        case 'dimensions':
          setShowDimensionsPanel(true);
          // Scroll to the dimensions button
          setTimeout(() => {
            if (dimensionsButtonRef.current) {
              dimensionsButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 100);
          break;
        case 'shapes':
          setShowShapesPanel(true);
          // Scroll to the shapes button
          setTimeout(() => {
            if (shapesButtonRef.current) {
              shapesButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 100);
          break;
        default:
          break;
      }
    }
  };

  const [houseDimensions, setHouseDimensions] = useState({
    width: state.houseDimensions.width || 0,
    length: state.houseDimensions.length || 0,
  });


  const handleShapeClick = (shapeId) => {
    dispatch({
      type: 'SET_ACTIVE_SHAPE',
      payload: shapeId === state.activeShape ? null : shapeId
    });
  };


  const handleColorChange = (color) => {
    dispatch({
      type: 'SET_ACTIVE_COLOR',
      payload: color
    });
    // Close the color picker panel
    togglePanel(null);
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string for better UX while typing
    const parsedValue = value === '' ? '' : parseFloat(value);
    setHouseDimensions(prev => ({
      ...prev,
      [name]: parsedValue === '' ? '' : parsedValue || 0
    }));
  };

  // Validate dimensions before applying
  const validateDimensions = () => {
    const errors = {};
    if (houseDimensions.width < 0) {
      errors.width = 'Width must be greater than 0';
    }
    if (houseDimensions.length < 0) {
      errors.length = 'Length must be greater than 0';
    }
    return errors;
  };

  const applyHouseDimensions = () => {
    // Validate dimensions
    if (houseDimensions.width < 0 || houseDimensions.length < 0) {
      alert('Please enter valid dimensions (greater than 0)');
      return;
    }

    // First, clear any existing house dimensions elements

    dispatch({
      type: 'CLEAR_HOUSE_DIMENSIONS'
    });


    // Update house dimensions in state
    dispatch({
      type: 'SET_HOUSE_DIMENSIONS',
      payload: {
        ...houseDimensions,
        isApplied: true
      }
    });

    // Close the dimensions panel
    togglePanel(null);

    // Create walls based on dimensions
    const width = houseDimensions.width;
    const length = houseDimensions.length;

    // Create four walls for the house
    // Position the walls to be centered on the grid (0,0,0)
    // This ensures the house is perfectly centered on the grid
    const walls = [
      // Front wall
      {
        start: { x: -width / 2, z: -length / 2 },
        end: { x: width / 2, z: -length / 2 },
        color: state.activeColor
      },
      // Right wall
      {
        start: { x: width / 2, z: -length / 2 },
        end: { x: width / 2, z: length / 2 },
        color: state.activeColor
      },
      // Back wall
      {
        start: { x: width / 2, z: length / 2 },
        end: { x: -width / 2, z: length / 2 },
        color: state.activeColor
      },
      // Left wall
      {
        start: { x: -width / 2, z: length / 2 },
        end: { x: -width / 2, z: -length / 2 },
        color: state.activeColor
      }
    ];

    // Add walls to the scene
    walls.forEach(wall => {
      dispatch({
        type: 'ADD_WALL',
        payload: wall
      });
    });

    // Add floor
    // Position the floor at the bottom-left corner of the house
    // This ensures perfect alignment with the walls and grid
    dispatch({
      type: 'ADD_FLOOR',
      payload: {
        position: { x:0 , z: 0 },
        size: width,  // Width of the floor matches house width
        length: length,  // Length of the floor matches house length
        color: '#a0a0a0'
      }
    });

    // Close the dimensions panel
    setShowDimensionsPanel(false);
  };

  return (
    <div className="absolute right-4 top-40 bg-white p-6 rounded-xl shadow-xl z-10 border border-gray-200 transition-all"
      style={{
        pointerEvents: 'auto',
        maxHeight: 'calc(100vh - 180px)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        width: (!showDimensionsPanel && !showColorPicker && !showShapesPanel) ? '72px' : '384px'
      }}>
      <div className="flex flex-col mb-1">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {(!showDimensionsPanel && !showColorPicker && !showShapesPanel) ? '' : 'Design Tools'}
        </h2>
        <div ref={toolbarContainerRef} className={`flex ${(!showDimensionsPanel && !showColorPicker && !showShapesPanel) ? 'flex-col items-center' : 'overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500'} gap-3 mt-3 pb-1`}>
          <button
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 flex-shrink-0 ${isRotationEnabled ? 'bg-blue-600 text-white font-medium' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            onClick={handleRotationToggle}
            title={isRotationEnabled ? 'Stop Rotation' : 'Start Rotation'}
          >
            <svg
              className={`h-4 w-4 transition-all duration-200 ${isRotationEnabled ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {(!showDimensionsPanel && !showColorPicker && !showShapesPanel) ? '' : 'Rotation'}
          </button>
          <button
            ref={dimensionsButtonRef}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 flex-shrink-0 ${showDimensionsPanel ? 'bg-blue-600 text-white font-medium' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            onClick={() => togglePanel('dimensions')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm0 2h10v8H5V6z" clipRule="evenodd" />
            </svg>
            {(!showDimensionsPanel && !showColorPicker && !showShapesPanel) ? '' : 'Dimensions'}
          </button>
          <button
            ref={colorButtonRef}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 flex-shrink-0 ${showColorPicker ? 'bg-blue-600 text-white font-medium' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            onClick={() => togglePanel('color')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
            {(!showDimensionsPanel && !showColorPicker && !showShapesPanel) ? '' : 'Colors'}
          </button>
          <button
            ref={shapesButtonRef}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 flex-shrink-0 ${showShapesPanel ? 'bg-blue-600 text-white font-medium' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            onClick={() => togglePanel('shapes')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            {(!showDimensionsPanel && !showColorPicker && !showShapesPanel) ? '' : 'Shapes'}
          </button>
        </div>
      </div>

      {showDimensionsPanel && (
        <div className="mb-6 p-5 bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414L10 11.414l1.42 1.42a3.5 3.5 0 101.414-1.414L11.414 10l1.42-1.42A3.5 3.5 0 1011.5 2 3.5 3.5 0 008 5.5a3.5 3.5 0 00.58 1.915L7.165 8.83A3.5 3.5 0 005.5 2zM13.5 5.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-8 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm11-1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
              </svg>
              House Dimensions
            </h3>
            {state.houseDimensions?.isApplied && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium border border-green-200">Applied</span>
            )}
          </div>
          <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 p-2">
            {/* Width input with validation */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Width</label>
                {validateDimensions().width && (
                  <span className="text-xs text-red-500">{validateDimensions().width}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="width"
                  value={houseDimensions.width === 0 && houseDimensions.width !== '' ? '' : houseDimensions.width}
                  onChange={handleDimensionChange}
                  min="0"
                  step="0.5"
                  placeholder="Enter width"
                  className={`w-full p-2.5 pl-3 pr-12 border ${validateDimensions().width ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center px-3 pointer-events-none bg-gray-100 rounded-r-md border-l border-gray-300">
                  <span className="text-gray-500 text-sm font-medium">m</span>
                </div>
              </div>
            </div>

            {/* Length input with validation */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Length</label>
                {validateDimensions().length && (
                  <span className="text-xs text-red-500">{validateDimensions().length}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="length"
                  value={houseDimensions.length === 0 && houseDimensions.length !== '' ? '' : houseDimensions.length}
                  onChange={handleDimensionChange}
                  min="0"
                  step="0.5"
                  placeholder="Enter length"
                  className={`w-full p-2.5 pl-3 pr-12 border ${validateDimensions().length ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center px-3 pointer-events-none bg-gray-100 rounded-r-md border-l border-gray-300">
                  <span className="text-gray-500 text-sm font-medium">m</span>
                </div>
              </div>
            </div>

            <button
              onClick={applyHouseDimensions}
              disabled={Object.keys(validateDimensions()).length > 0}
              className={`w-full mt-3 px-4 py-2.5 rounded-md font-medium transition-all duration-200 ${Object.keys(validateDimensions()).length > 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
            >
              {state.houseDimensions?.isApplied ? 'Update Dimensions' : 'Apply Dimensions'}
            </button>
          </div>
        </div>
      )}



      {showColorPicker && (
        <div className="mb-6 p-5 bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Color Picker</h3>
          <div className="overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 mb-4">
            <div className="grid grid-flow-col auto-cols-max gap-3 p-2">
              {['#808080', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#800000', '#000080', '#A0522D', '#4682B4', '#2E8B57'].map((color) => (
                <div
                  key={color}
                  className={`w-10 h-10 rounded-lg cursor-pointer border-2 transition-all duration-200 transform hover:scale-105 ${state.activeColor === color ? 'border-black shadow-md scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Custom Color</label>
              <div
                className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: state.activeColor }}
              />
            </div>
            <div className="relative">
              <input
                type="color"
                value={state.activeColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 cursor-pointer rounded-md"
              />
              <div className="mt-2 text-xs text-gray-600 flex justify-between">
                <span>Current: {state.activeColor}</span>
                <button
                  onClick={() => handleColorChange('#808080')}
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {showShapesPanel && (
        <div className="mb-6 p-5 bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Geometric Shapes</h3>
          <div className="flex-col space-y-2 max-h-60 overflow-y-auto overflow-x-auto pr-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
            {shapes.map((shape) => {
              return (
                <button
                  key={shape.id}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 
                    ${state.activeShape === shape.id ? 'bg-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-500' : 'bg-white hover:bg-gray-50 border border-gray-200'}`}
                  onClick={() => handleShapeClick(shape.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-8 h-8 flex items-center justify-center bg-gray-50 rounded-md">{shape.icon}</span>
                    <span className="font-medium">{shape.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full border ${state.activeShape === shape.id ? 'border-blue-500' : 'border-gray-300'}`}
                      style={{ backgroundColor: state.activeColor }}
                    />
                    {state.activeShape === shape.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}