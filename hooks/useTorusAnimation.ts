// FIX: Import React to provide the namespace for types like React.RefObject.
import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { TorusParameters, Point4D, Point3D, ProjectedPoint } from '../types';

const SQRT1_2 = Math.sqrt(0.5);

// 4D Rotation matrices application
function rotate4D(p: Point4D, angles: number[]): Point4D {
  let [x, y, z, w] = p;
  const [a_xy, a_xz, a_xw, a_yz, a_yw, a_zw] = angles;

  // xy plane
  let d_x = x * Math.cos(a_xy) - y * Math.sin(a_xy);
  let d_y = x * Math.sin(a_xy) + y * Math.cos(a_xy);
  x = d_x; y = d_y;

  // xz plane
  d_x = x * Math.cos(a_xz) - z * Math.sin(a_xz);
  let d_z = x * Math.sin(a_xz) + z * Math.cos(a_xz);
  x = d_x; z = d_z;

  // xw plane
  d_x = x * Math.cos(a_xw) - w * Math.sin(a_xw);
  let d_w = x * Math.sin(a_xw) + w * Math.cos(a_xw);
  x = d_x; w = d_w;

  // yz plane
  d_y = y * Math.cos(a_yz) - z * Math.sin(a_yz);
  d_z = y * Math.sin(a_yz) + z * Math.cos(a_yz);
  y = d_y; z = d_z;

  // yw plane
  d_y = y * Math.cos(a_yw) - w * Math.sin(a_yw);
  d_w = y * Math.sin(a_yw) + w * Math.cos(a_yw);
  y = d_y; w = d_w;
  
  // zw plane
  d_z = z * Math.cos(a_zw) - w * Math.sin(a_zw);
  d_w = z * Math.sin(a_zw) + w * Math.cos(a_zw);
  z = d_z; w = d_w;

  return [x, y, z, w];
}

// Stereographic projection from 4D (on S³) to 3D
function stereographicProjection(p: Point4D): Point3D {
  const [x, y, z, w] = p;
  const den = 1 - w;
  if (Math.abs(den) < 1e-6) return [0, 0, 0];
  return [x / den, y / den, z / den];
}

// 3D rotation (for viewing)
function rotate3D(p: Point3D, angles: {x: number, y: number}): Point3D {
    let [x, y, z] = p;
    
    // Y-axis rotation
    let d_x = x * Math.cos(angles.y) + z * Math.sin(angles.y);
    let d_z = -x * Math.sin(angles.y) + z * Math.cos(angles.y);
    x = d_x; z = d_z;

    // X-axis rotation
    let d_y = y * Math.cos(angles.x) - z * Math.sin(angles.x);
    d_z = y * Math.sin(angles.x) + z * Math.cos(angles.x);
    y = d_y; z = d_z;

    return [x, y, z];
}

export const useTorusAnimation = (
  svgRef: React.RefObject<SVGSVGElement>,
  parameters: TorusParameters
) => {
  const [isDragging, setIsDragging] = useState(false);
  const rotation = useRef({ x: Math.PI / 4, y: Math.PI / 4 });
  const pointsRef = useRef<Array<{ id: number; original: Point4D; color: string }>>([]);

  const generatePoints = useCallback((count: number) => {
    const colorScale = d3.scaleSequential(d3.interpolateViridis);
    const newPoints = Array.from({ length: count }, (_, i) => {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * 2 * Math.PI;
      const point: Point4D = [
        SQRT1_2 * Math.cos(theta),
        SQRT1_2 * Math.sin(theta),
        SQRT1_2 * Math.cos(phi),
        SQRT1_2 * Math.sin(phi),
      ];
      return { id: i, original: point, color: colorScale(phi / (2 * Math.PI)) };
    });
    pointsRef.current = newPoints;
  }, []);
  
  useEffect(() => {
    generatePoints(parameters.pointCount);
  }, [parameters.pointCount, generatePoints]);


  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    let width = svg.node()!.clientWidth;
    let height = svg.node()!.clientHeight;

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      width = entries[0].contentRect.width;
      height = entries[0].contentRect.height;
    });
    resizeObserver.observe(svg.node()!);

    const drag = d3.drag<SVGSVGElement, unknown>()
      .on('start', () => setIsDragging(true))
      .on('drag', (event) => {
        rotation.current.y += event.dx * 0.005;
        rotation.current.x -= event.dy * 0.005;
        rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));
      })
      .on('end', () => setIsDragging(false));
    
    svg.call(drag);

    const timer = d3.timer((elapsed) => {
      const t = elapsed * 0.001;
      const {
        rotationSpeedXY, rotationSpeedXZ, rotationSpeedXW,
        rotationSpeedYZ, rotationSpeedYW, rotationSpeedZW,
      } = parameters;

      const angles4D = [
        t * rotationSpeedXY, t * rotationSpeedXZ, t * rotationSpeedXW,
        t * rotationSpeedYZ, t * rotationSpeedYW, t * rotationSpeedZW,
      ];

      const projectedPoints: ProjectedPoint[] = pointsRef.current.map(p => {
        const rotated4D = rotate4D(p.original, angles4D);
        const projected3D = stereographicProjection(rotated4D);
        const rotated3D = rotate3D(projected3D, rotation.current);

        const perspective = 1.5 / (1.5 + rotated3D[2]);
        const scale = Math.min(width, height) * 0.4;
        
        return {
          id: p.id,
          x: width / 2 + rotated3D[0] * scale * perspective,
          y: height / 2 - rotated3D[1] * scale * perspective,
          z: rotated3D[2],
          color: p.color
        };
      });

      projectedPoints.sort((a, b) => a.z - b.z);

      svg.selectAll<SVGCircleElement, ProjectedPoint>('circle')
        .data(projectedPoints, (d: ProjectedPoint) => d.id)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => Math.max(0.1, (d.z + 1.5) * 0.8))
        .attr('fill', d => d.color)
        .attr('fill-opacity', d => Math.max(0.1, (d.z + 1.5) * 0.5));
    });

    return () => {
      timer.stop();
      resizeObserver.disconnect();
      svg.on('.drag', null);
    };
  }, [parameters, svgRef]);

  return { rotation: rotation.current, isDragging };
};
