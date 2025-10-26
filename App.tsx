
import React, { useState } from 'react';
import TorusVisualization from './components/TorusVisualization';
import Controls from './components/Controls';
import type { TorusParameters } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<TorusParameters>({
    pointCount: 2500,
    rotationSpeedXY: 0.5,
    rotationSpeedXZ: 0.3,
    rotationSpeedXW: 0.7,
    rotationSpeedYZ: 0.2,
    rotationSpeedYW: 0.4,
    rotationSpeedZW: 0.6,
  });

  return (
    <div className="relative w-screen h-screen bg-black text-gray-200 font-sans">
      <TorusVisualization parameters={params} />
      <div className="absolute top-0 left-0 p-4 md:p-6 w-full md:w-auto">
        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
            Clifford Torus Projection
          </h1>
          <p className="text-sm text-gray-400">
            Inspired by Clayton Shonkwiler
          </p>
        </header>
        <Controls parameters={params} setParameters={setParams} />
      </div>
       <footer className="absolute bottom-4 right-4 text-xs text-gray-500">
          <p>Drag to rotate the 3D projection</p>
        </footer>
    </div>
  );
};

export default App;
