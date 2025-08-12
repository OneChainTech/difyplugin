declare module 'eviltransform' {
  export type CoordinateTuple = [number, number];
  export interface CoordinateObject {
    lat: number;
    lng: number;
    latitude?: number;
    longitude?: number;
    [key: string]: unknown;
  }

  export interface EvilTransform {
    wgs2gcj(lat: number, lng: number): CoordinateTuple | CoordinateObject;
    gcj2wgs?(lat: number, lng: number): CoordinateTuple | CoordinateObject;
    [key: string]: unknown;
  }

  const eviltransform: EvilTransform;
  export default eviltransform;
}


