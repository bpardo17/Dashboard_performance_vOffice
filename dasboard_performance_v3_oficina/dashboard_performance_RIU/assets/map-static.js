am5.ready(async function () {

  // Create root element
  var root = am5.Root.new("chartdiv__static");
  root._logo.dispose();

  // Create the map chart
  var static_chart = root.container.children.push(
    am5map.MapChart.new(root, {
      wheelY: "none",
      panX: "translateX",
      panY: "translateY",
      minZoomLevel: 1,
      maxZoomLevel: 80,
      rotationX: -10,
    })
  );

  // Create series for background fill
  var backgroundSeries = static_chart.series.push(
    am5map.MapPolygonSeries.new(root, {})
  );
  backgroundSeries.mapPolygons.template.setAll({
    fill: "rgb(20, 20, 20)",
    fillOpacity: 0,
    strokeOpacity: 0,
  });
  
  // Create main polygon series for countries
  var polygonSeries = static_chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"],
    })
  );
  polygonSeries.mapPolygons.template.setAll({
    fill: "#64718F",
    fillOpacity: 1,
    stroke: "#14101C",
    strokeWidth: 0.5,
  });
  
  // Create line series for trajectory lines
  var lineSeries = static_chart.series.push(am5map.MapLineSeries.new(root, {}));
  lineSeries.mapLines.template.setAll({
    stroke: root.interfaceColors.get("alternativeBackground"),
    strokeOpacity: 0.3,
  });

  // Abrimos este try para lanzar el mapa.
  try{
    static_chart.appear(0, 0);
  } catch (error) {
    console.log('Error con el mapa: '+error);
  }
});
