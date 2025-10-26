
export type Point4D = [number, number, number, number];
export type Point3D = [number, number, number];
export type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
  color: string;
};

export interface TorusParameters {
  pointCount: number;
  rotationSpeedXY: number;
  rotationSpeedXZ: number;
  rotationSpeedXW: number;
  rotationSpeedYZ: number;
  rotationSpeedYW: number;
  rotationSpeedZW: number;
}
