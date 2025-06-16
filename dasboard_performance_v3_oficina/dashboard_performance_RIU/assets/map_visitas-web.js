export function initializeMapWeb() {
  
  // Función para eliminar el root del mapa cuando hay cambian las tabs
  function maybeDisposeRoot(divId) {
    am5.array.each(am5.registry.rootElements, function (root) {
      if (root.dom && root.dom.id === divId) {
        root.dispose();
      }
    });
  };
  
  am5.ready(function () {
    
    maybeDisposeRoot("chartdiv__cliente");

    // Create root element
    var root = am5.Root.new("chartdiv__visitas-web");
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    root._logo.dispose();

    // Create the map chart
    var chart = root.container.children.push(
      am5map.MapChart.new(root, {
        wheelY: "none",
        panX: "none",
        panY: "none",
        minZoomLevel: 16,
        maxZoomLevel: 16,
        rotationX: -10,
      })
    );

    // Create series for background fill
    var backgroundSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {})
    );
    backgroundSeries.mapPolygons.template.setAll({
      //fill: "rgb(20, 20, 20)",
      fill: "transparent",
      fillOpacity: 0,
      strokeOpacity: 0,
    });

    // Add background polygon
    backgroundSeries.data.push({
      geometry: am5map.getGeoCircle({ latitude: 48.86, longitude: 2.35 }, 2)
    });
    
    // Create main polygon series for countries
    var polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"],
      })
    );
    polygonSeries.mapPolygons.template.setAll({
      //fill: "#4f4f4f",
      fill: "transparent",
      fillOpacity: 0,
      strokeWidth: 0,
      //stroke: "#4f4f4f",
      stroke: "transparent",
    });

    // Create line series for trajectory lines
    var lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
    lineSeries.mapLines.template.setAll({
      stroke: root.interfaceColors.get("alternativeBackground"),
      strokeOpacity: 0.3,
    });

    // Create point series for markers
    var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

    // am5.array.each(am5.registry.rootElements, function(root) {
    //   if (root.dom.id == "chartdiv__static") {
    //     console.log('test', polygonSeries);
    //     polygonSeries.events.on("datavalidated", function() {
    //       console.log('datavalidated');
    //       root.container.children.am5map.zoomToGeoPoint({ latitude: 40.4242393, longitude: -3.711363 }, 80, true, 4500);
    //     });
    //   }
    // });

    // Abrimos un try únicamente para el fetch del endpoint del mapa.
    /*try {
      // Realizar el fetch del endpoint
      const response = await fetch(
        "https://europe-west1-bq-consumer-riu-api.cloudfunctions.net/get_monitor_data"
      );
      // Leemos primero el json en formato texto para poder convertir NaN a null, porque sino la llamada al json falla.
      const text = await response.text();
      // Convertimos NaN en "-" para evitar que la respuesta del endpoint de un fallo.
      const formatText = text.replace(/\bNaN\b/g, 'null');
      // Obtenemos el json sin fallos de formato.
      const dataRiu = JSON.parse(formatText);
      // Guardamos los datos de las métricas dentro de la localStorage. De esta manera si el fetch falla, tenemos la útlima actualización en la local y podemos ir tirando con esos datos hasta que se levante el servicio.
      localStorage.setItem('dataMetrics', JSON.stringify(dataRiu));
    }catch(error){
      console.error('Está fallando el fetch del mapa: '+error);
    }*/

    // Abrimos otro try para el resto del código.
    try {
      
      // Creamos una variable en la que vamos a guardar la respuesta en json del endpoint guardada en la local.
      var secureDataRiu = JSON.parse(localStorage.getItem('dataMetrics'));
      
      // Define bullets with dynamic size and max width
      pointSeries.bullets.push(function (root, series, dataItem) {
        var maxRadius = 24; // Maximum bullet radius
        var scaledRadius = dataItem.dataContext.value / 0.5; // Scale dynamically
        var radius = Math.min(scaledRadius, maxRadius); // Apply max limit
        var colours = dataItem.dataContext.color;
        var circle = am5.Circle.new(root, {
          radius: radius, // Set the radius with a max limit
          fill: colours,
          strokeWidth: 3,
          strokeOpacity: 1,
          shadowColor: am5.color("rgba(52,58,64,1)"),
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        });
        circle.animate({
          key: "radius",
          from: 0,
          to: radius*1.5,
          duration: 1000,
          easing: am5.ease.cubicOut,
        });
        return am5.Bullet.new(root, {
          sprite: circle,
        });
      });
      
      // Add city data to point series for VISITAS WEB

      for (var i = 0; i < secureDataRiu.visitas_web.map.length; i++) {
        var pointMap = secureDataRiu.visitas_web.map[i];
        addCity(pointMap.long, pointMap.lat, pointMap.value, pointMap.color);
        
      }
      
      // Función addCity con color incluido y animación de opacidad
      function addCity(longitude, latitude, value, color) {
        setTimeout(function() {
          pointSeries.data.push({
            geometry: { type: "Point", coordinates: [longitude, latitude] },
            value: value,
            color: color, // Asignar el color al punto
          });
        }, i * 75); // Delay of 100ms for each element
      }

      chart.appear(0, 0);

    } catch (error) {
      console.log('Error con el mapa: '+error);
    }
  });

}