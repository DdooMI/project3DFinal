import { useScene } from '../context/SceneContext';
import { useState, useRef } from 'react';

// Furniture items organized by category
const furnitureCategories = {
  beds: [
    { id: 'bed', name: 'Bed', modelPath: 'src/models/bed.glb', emoji: '🛏️' },
    { id: 'ikea_bed', name: 'IKEA Bed', modelPath: 'src/models/ikea_idanas_single_bed.glb', emoji: '🛌' },
  ],
  chairs: [
    { id: 'chair', name: 'Chair', modelPath: 'src/models/chair.glb', emoji: '🪑' },
  ],
  sofas: [
    { id: 'sofa', name: 'Sofa', modelPath: 'src/models/sofa.glb', emoji: '🛋️' },
  ],
};

export default function LeftSidebar() {
  const { state, dispatch } = useScene();
  const [showFurniturePanel, setShowFurniturePanel] = useState(false);
  const furnitureButtonRef = useRef(null);

  const toggleFurniturePanel = () => {
    setShowFurniturePanel((prev) => !prev);
  };

  const handleFurnitureClick = (furnitureId) => {
    const isSelected = furnitureId === state.selectedFurnitureId;
    dispatch({
      type: 'SELECT_FURNITURE',
      payload: isSelected ? null : furnitureId,
    });
    dispatch({
      type: 'SET_ACTIVE_SHAPE',
      payload: isSelected ? null : 'furniture',
    });
  };

  return (
    <div className="absolute left-4 top-40 bottom-4 w-16 h-16 bg-white rounded-lg shadow-lg flex flex-col items-center py-2 z-10">
      <button
        ref={furnitureButtonRef}
        className={`w-12 h-12  rounded-lg flex items-center justify-center text-lg transition-colors duration-200 ${
          showFurniturePanel ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        onClick={toggleFurniturePanel}
        aria-label="Toggle furniture panel"
      >
        🪑
      </button>

      {showFurniturePanel && (
        <div className="absolute left-20 top-0 w-64 bg-white rounded-lg shadow-lg p-4 z-20 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Furniture</h3>
          
          {/* Beds Category */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">Beds</h4>
            <div className="grid grid-cols-2 gap-2">
              {furnitureCategories.beds.map((item) => (
                <button
                  key={item.id}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors duration-200 ${
                    state.selectedFurnitureId === item.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFurnitureClick(item.id)}
                  aria-label={`Select ${item.name}`}
                >
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="text-xs">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Chairs Category */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">Chairs</h4>
            <div className="grid grid-cols-2 gap-2">
              {furnitureCategories.chairs.map((item) => (
                <button
                  key={item.id}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors duration-200 ${
                    state.selectedFurnitureId === item.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFurnitureClick(item.id)}
                  aria-label={`Select ${item.name}`}
                >
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="text-xs">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Sofas Category */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">Sofas</h4>
            <div className="grid grid-cols-2 gap-2">
              {furnitureCategories.sofas.map((item) => (
                <button
                  key={item.id}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors duration-200 ${
                    state.selectedFurnitureId === item.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFurnitureClick(item.id)}
                  aria-label={`Select ${item.name}`}
                >
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="text-xs">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
