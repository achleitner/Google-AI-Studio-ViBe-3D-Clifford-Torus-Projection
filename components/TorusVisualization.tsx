
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTorusAnimation } from '../hooks/useTorusAnimation';
import type { TorusParameters } from '../types';

interface TorusVisualizationProps {
  parameters: TorusParameters;
}

const TorusVisualization: React.FC<TorusVisualizationProps> = ({ parameters }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { rotation, isDragging } = useTorusAnimation(svgRef, parameters);

  return (
    <div 
      className={`w-full h-full flex items-center justify-center transition-cursor duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ touchAction: 'none' }}
    >
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default TorusVisualization;
