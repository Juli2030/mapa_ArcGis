import { useEffect, useRef, useState } from 'react'
import '@arcgis/core/assets/esri/themes/light/main.css' 
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol'
import './App.css'


const Maps_confing = {
  initialBasemap: 'gray-vector',         
  alternativeBasemap: 'dark-gray-vector', 
  center: [-74.05132, 4.67394],           // ESRI Colombia: Calle 90 #13-40
  zoom: 17,
  widgetPosition: 'top-right'
};

function App() {
  const mapsContaiR = useRef(null);
  const [mapsError, setMapsError] = useState(null);
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let viewInstance = null;

    if (!mapsContaiR.current) {
      setMapsError("No se encontró el contenedor del mapa de Bogotá");
      setIsloading(false);
      return;
    }

    const iniciarMap = async () => {
      try {
        setIsloading(true);
        setMapsError(null);

        // Crea el mapa base
        const map = new Map({
          basemap: Maps_confing.initialBasemap
        });

        // Vista del mapa
        viewInstance = new MapView({
          container: mapsContaiR.current,
          map: map,
          center: Maps_confing.center,
          zoom: Maps_confing.zoom,
          constraints: {
            snapToZoom: false,
            rotationEnabled: false
          },
          popupEnabled: true,
          highlightOptions: {
            color: [255, 255, 0, 0.5]
          }
        });

        // Esperar a que la vista esté iniciada
        await viewInstance.when();

        if (!isMounted) return;

        if (viewInstance) {
          // cambiar mapas base
          const toggleWidget = new BasemapToggle({
            view: viewInstance,
            nextBasemap: Maps_confing.alternativeBasemap
          });
          viewInstance.ui.add(toggleWidget, Maps_confing.widgetPosition);

          // Marcador
          const esriMarker = new Graphic({
            geometry: new Point({
              longitude: Maps_confing.center[0],
              latitude: Maps_confing.center[1]
            }),
            symbol: new SimpleMarkerSymbol({
              color: [220, 50, 50],
              size: 14,
              outline: {
                color: [255, 255, 255],
                width: 2
              }
            }),
            popupTemplate: {
              title: "ESRI Colombia",
              content: "Calle 90 #13-40, Bogotá D.C., Colombia"
            }
          });
          viewInstance.graphics.add(esriMarker);
        }

        if (isMounted) {
          setIsloading(false);
        }

      } catch (error) {
        if (isMounted) {
          console.error("EL MAPA DE ARCGIS NO SE CARGA.", error);
          setMapsError("Verifica la conexión o la configuración.");
          setIsloading(false);
        }
      }
    };

    setTimeout(() => {
      if (isMounted) iniciarMap();
    }, 100);

    return () => {
      isMounted = false;
      setTimeout(() => {
        if (viewInstance && typeof viewInstance.destroy === "function") {
          viewInstance.destroy();
          console.log("Limpieza del mapa correcta");
        }
      }, 100);
    };

  }, []);

  return (
    <div className='container_app'>
      {/* Contenedor del mapa */}
      <div
        id='viewDiV'
        ref={mapsContaiR}
        className='mapviewC'
        role='application'
        aria-label='Mapa de ArcGIS - ESRI Colombia'
      />

      {/* Overlay de carga */}
      {isLoading && (
        <div className='map-loading' aria-live='polite'>
          <p>Se está cargando el mapa, por favor espere...</p>
        </div>
      )}

      {/* Overlay de error */}
      {mapsError && (
        <div className='map-error' role='alert'>
          <p>A {mapsError}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      )}
    </div>
  )
}

export default App;