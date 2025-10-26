
import React, { useState } from 'react';
import type { TorusParameters } from '../types';

interface ControlsProps {
  parameters: TorusParameters;
  setParameters: React.Dispatch<React.SetStateAction<TorusParameters>>;
}

interface SliderConfig {
  id: keyof TorusParameters;
  label: string;
  min: number;
  max: number;
  step: number;
}

const controlConfig: SliderConfig[] = [
  { id: 'pointCount', label: 'Point Count', min: 500, max: 10000, step: 100 },
  { id: 'rotationSpeedXY', label: 'Rot α (XY)', min: 0, max: 2, step: 0.01 },
  { id: 'rotationSpeedXZ', label: 'Rot β (XZ)', min: 0, max: 2, step: 0.01 },
  { id: 'rotationSpeedXW', label: 'Rot γ (XW)', min: 0, max: 2, step: 0.01 },
  { id: 'rotationSpeedYZ', label: 'Rot δ (YZ)', min: 0, max: 2, step: 0.01 },
  { id: 'rotationSpeedYW', label: 'Rot ε (YW)', min: 0, max: 2, step: 0.01 },
  { id: 'rotationSpeedZW', label: 'Rot ζ (ZW)', min: 0, max: 2, step: 0.01 },
];

const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);


const Controls: React.FC<ControlsProps> = ({ parameters, setParameters }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: keyof TorusParameters
  ) => {
    setParameters((prev) => ({
      ...prev,
      [id]: parseFloat(e.target.value),
    }));
  };

  const resetToDefaults = () => {
    setParameters({
        pointCount: 2500,
        rotationSpeedXY: 0.5,
        rotationSpeedXZ: 0.3,
        rotationSpeedXW: 0.7,
        rotationSpeedYZ: 0.2,
        rotationSpeedYW: 0.4,
        rotationSpeedZW: 0.6,
    });
  }

  return (
    <div className="bg-black bg-opacity-50 backdrop-blur-sm p-4 rounded-lg w-full max-w-xs md:max-w-sm shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Controls</h2>
            <button onClick={() => setShowInfo(!showInfo)} className="text-gray-400 hover:text-white transition-colors">
                <InfoIcon className="w-5 h-5" />
            </button>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white transition-transform"
        >
          <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 p-3 bg-gray-800 bg-opacity-70 rounded-md text-xs text-gray-300">
            <p>This visualization shows a stereographic projection of a Clifford torus from 4D to 3D space. The sliders control the rotation speeds in the 6 independent planes of 4D rotation.</p>
        </div>
      )}

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-3">
          {controlConfig.map(({ id, label, min, max, step }) => (
            <div key={id}>
              <label htmlFor={id} className="text-sm font-medium text-gray-300 flex justify-between">
                <span>{label}</span>
                <span>{parameters[id]}</span>
              </label>
              <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={parameters[id]}
                onChange={(e) => handleChange(e, id)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm"
              />
            </div>
          ))}
          <button onClick={resetToDefaults} className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors">
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
