import { createContext, useContext, useReducer } from 'react'

const SceneContext = createContext()

const initialState = {
  objects: [],
  walls: [],
  floors: [],
  history: [],
  currentStep: -1,
  activeShape: null,
  activeColor: '#808080', // Default color for shapes
  isRotationEnabled: true, // Camera rotation state
  selectedFurnitureId: null, // Track selected furniture item
  occupiedGridCells: {}, // Make sure this is initialized as an empty object
  houseDimensions: {
    width: 0,
    length: 0,
    height: 3,
    isApplied: false,
    error: null // Add error field
  }
}

function sceneReducer(state, action) {
  switch (action.type) {
    case 'CLEAR_HOUSE_DIMENSIONS':
      // Clear all house dimensions elements and reset dimensions
      return {
        ...state,
        objects: [],
        walls: [],
        floors: [],

        houseDimensions: {
          ...initialState.houseDimensions,
          isApplied: false
        }
      }
    case 'SET_HOUSE_DIMENSIONS':
      // Validate dimensions
      { if (action.payload.width <= 0 || action.payload.length <= 0 || action.payload.height <= 0) {
        return {
          ...state,
          houseDimensions: {
            ...state.houseDimensions,
            error: 'Dimensions must be greater than 0'
          }
        }
      }

      // Max size validation
      if (action.payload.width > 100 || action.payload.length > 100 || action.payload.height > 10) {
        return {
          ...state,
          houseDimensions: {
            ...state.houseDimensions,
            error: 'Dimensions exceed maximum allowed size'
          }
        }
      }

      const newHouseDimensions = {
        ...state.houseDimensions,
        ...action.payload,
        isApplied: true,
        error: null // Clear any previous errors
      };
      return {
        ...state,
        houseDimensions: newHouseDimensions,
        history: [...state.history.slice(0, state.currentStep + 1), {
          type: 'SET_HOUSE_DIMENSIONS',
          data: newHouseDimensions
        }],
        currentStep: state.currentStep + 1
      } }
    case 'ADD_OBJECT':
      { const newObject = {
        ...action.payload,
        id: Date.now(),
        position: action.payload.position || { x: 0, y: 0, z: 0 }
      }
      return {
        ...state,
        objects: [...state.objects, newObject],
        history: [...state.history.slice(0, state.currentStep + 1), {
          type: 'ADD_OBJECT',
          data: newObject
        }],
        currentStep: state.currentStep + 1
      } }

    case 'ADD_WALL':
      { const newWall = { 
        ...action.payload, 
        id: Date.now(),
        color: action.payload.color || state.activeColor 
      }
      return {
        ...state,
        walls: [...state.walls, newWall],
        history: [...state.history.slice(0, state.currentStep + 1), {
          type: 'ADD_WALL',
          data: newWall
        }],
        currentStep: state.currentStep + 1
      } }
    case 'ADD_FLOOR':
      { const newFloor = { 
        ...action.payload, 
        id: Date.now(),
        color: action.payload.color || state.activeColor 
      }
      return {
        ...state,
        floors: [...state.floors, newFloor],
        history: [...state.history.slice(0, state.currentStep + 1), {
          type: 'ADD_FLOOR',
          data: newFloor
        }],
        currentStep: state.currentStep + 1
      } }
    case 'ADD_FURNITURE':
      { const newFurniture = {
        ...action.payload,
        id: action.payload.id || Date.now()
      }
      return {
        ...state,
        objects: [...state.objects, newFurniture],
        history: [...state.history.slice(0, state.currentStep + 1), {
          type: 'ADD_FURNITURE',
          data: newFurniture
        }],
        currentStep: state.currentStep + 1
      } }
    case 'SET_ACTIVE_SHAPE':
      return {
        ...state,
        activeShape: action.payload
      }
    case 'SET_ACTIVE_COLOR':
      return {
        ...state,
        activeColor: action.payload
      }
    case 'TOGGLE_ROTATION':
      return {
        ...state,
        isRotationEnabled: !state.isRotationEnabled
      }
    case 'SELECT_FURNITURE':
      return {
        ...state,
        selectedFurnitureId: action.payload
      }
    case 'PLACE_FURNITURE':
      { 
        const placedFurniture = {
          ...action.payload,
          id: Date.now(),
          type: 'furniture'
        };
        
        // Create a new occupiedGridCells object with the new furniture's cells
        const newOccupiedGridCells = { ...state.occupiedGridCells };
        
        // Add the cells occupied by this furniture
        if (action.payload.occupiedCells) {
          Object.keys(action.payload.occupiedCells).forEach(cellKey => {
            newOccupiedGridCells[cellKey] = true;
          });
        }
        
        return {
          ...state,
          objects: [...state.objects, placedFurniture],
          occupiedGridCells: newOccupiedGridCells,
          history: [...state.history.slice(0, state.currentStep + 1), {
            type: 'PLACE_FURNITURE',
            data: placedFurniture,
            occupiedCells: action.payload.occupiedCells
          }],
          currentStep: state.currentStep + 1
        };
      }

    case 'UNDO':
      if (state.currentStep >= 0) {
        const lastAction = state.history[state.currentStep]
        const newState = { ...state, currentStep: state.currentStep - 1 }

        // Find the previous state for the affected property
        const getPreviousState = (propertyType) => {
          return state.currentStep > 0 ? 
            state.history.slice(0, state.currentStep)
              .reverse()
              .find(action => action.type === propertyType)?.data :
            null
        }

        switch (lastAction.type) {
          case 'SET_HOUSE_DIMENSIONS':
            { const prevDimensions = getPreviousState('SET_HOUSE_DIMENSIONS') || initialState.houseDimensions
            newState.houseDimensions = prevDimensions
            
            // Clear elements only if dimensions are not applied
            if (!prevDimensions.isApplied) {
              newState.walls = []
              newState.floors = []
              newState.curvedWalls = []
            } else {
              // Keep existing elements when dimensions are applied
              const prevElements = state.history
                .slice(0, state.currentStep)
                .filter(action => ['ADD_WALL', 'ADD_FLOOR', 'ADD_CURVED_WALL'].includes(action.type))
                .map(action => action.data)
              
              newState.walls = prevElements.filter(el => el.type === 'wall')
              newState.floors = prevElements.filter(el => el.type === 'floor')
              newState.curvedWalls = prevElements.filter(el => el.type === 'curvedWall')
            }
            break }

          case 'ADD_OBJECT':
            newState.objects = state.objects.filter(obj => obj.id !== lastAction.data.id)
            break

          case 'ADD_WALL':
            newState.walls = state.walls.filter(wall => wall.id !== lastAction.data.id)
            break

          case 'ADD_FLOOR':
            newState.floors = state.floors.filter(floor => floor.id !== lastAction.data.id)

            break
            
          case 'ADD_FURNITURE':
          case 'PLACE_FURNITURE':
            newState.objects = state.objects.filter(obj => obj.id !== lastAction.data.id)
            
            // Remove the occupied cells for this furniture
            if (lastAction.occupiedCells) {
              const newOccupiedGridCells = { ...state.occupiedGridCells };
              Object.keys(lastAction.occupiedCells).forEach(cellKey => {
                delete newOccupiedGridCells[cellKey];
              });
              newState.occupiedGridCells = newOccupiedGridCells;
            }
            break

        }

        return newState
      }
      return state

    case 'REDO':
      if (state.currentStep < state.history.length - 1) {
        const nextAction = state.history[state.currentStep + 1]
        const newState = { ...state, currentStep: state.currentStep + 1 }

        switch (nextAction.type) {
          case 'SET_HOUSE_DIMENSIONS':
            newState.houseDimensions = nextAction.data
            
            // Clear elements only if dimensions are not applied
            if (!nextAction.data.isApplied) {
              newState.walls = []
              newState.floors = []
              newState.curvedWalls = []
            } else {
              // Restore previous elements when redoing applied dimensions
              const prevState = state.history.slice(0, state.currentStep + 1)
                .reverse()
                .find(action => action.type === 'SET_HOUSE_DIMENSIONS')
              
              if (prevState && !prevState.data.isApplied) {
                newState.walls = []
                newState.floors = []
                newState.lines = []
                newState.circles = []
                newState.curvedWalls = []
              }
            }
            break

          case 'ADD_OBJECT':
            newState.objects = [...state.objects, nextAction.data]
            break

          case 'ADD_WALL':
            newState.walls = [...state.walls, nextAction.data]
            break

          case 'ADD_FLOOR':
            newState.floors = [...state.floors, nextAction.data]
            break
            
          case 'ADD_FURNITURE':
          case 'PLACE_FURNITURE':
            newState.objects = [...state.objects, nextAction.data]
            
            // Add back the occupied cells for this furniture
            if (nextAction.occupiedCells) {
              const newOccupiedGridCells = { ...state.occupiedGridCells };
              Object.keys(nextAction.occupiedCells).forEach(cellKey => {
                newOccupiedGridCells[cellKey] = true;
              });
              newState.occupiedGridCells = newOccupiedGridCells;
            }
            break

          case 'CLEAR_HOUSE_DIMENSIONS':
            newState.walls = []
            newState.floors = []

            break
        }

        return newState
      }
      return state
    default:
      return state
  }
}

export function SceneProvider({ children }) {
  const [state, dispatch] = useReducer(sceneReducer, initialState)

  return (
    <SceneContext.Provider value={{ state, dispatch }}>
      {children}
    </SceneContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useScene() {
  const context = useContext(SceneContext)
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider')
  }
  return context
}