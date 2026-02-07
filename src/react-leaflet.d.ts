
declare module 'react-leaflet' {
    import { ComponentType } from 'react';
    export const MapContainer: ComponentType<any>;
    export const TileLayer: ComponentType<any>;
    export const Marker: ComponentType<any>;
    export const Popup: ComponentType<any>;
    export const Tooltip: ComponentType<any>;
    export const useMap: () => any;
    export const useMapEvent: (event: string, handler: (e: any) => void) => any;
    export const useMapEvents: (handlers: { [key: string]: (e: any) => void }) => any;
}
