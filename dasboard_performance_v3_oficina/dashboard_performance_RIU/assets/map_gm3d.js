export function initializeMap3D() {
  var screenMap3D = document.getElementsByClassName("detail-googlemaps")[0];
  var map3D = document.getElementById("gmp-map-3d");

  if (map3D.hasChildNodes()) {
    map3D.removeChild(map3D.firstElementChild);
  }

  function load3DMap() {
    var hotelDataRiu = JSON.parse(localStorage.getItem('randomHotels'));

//     var hotelDataRiu = [
//   {
//     "hotel_id": 406,
//     "hotel_name": "Hotel Riu Arecas",
//     "lat": 28.0955012056,
//     "long": -16.7457689825,
//     "total_clientes_hospedados": {
//       "metric_cy": 874,
//       "metric_ly": 903,
//       "metric_diff": -3.2
//     },
//     "reservas_usuarios_rc": {
//       "metric_cy": 61.8,
//       "metric_ly": 61.7,
//       "metric_diff": null
//     },
//     "usuarios_repetidores": {
//       "metric_cy": 59.1,
//       "metric_ly": null,
//       "metric_diff": null
//     },
//     "puntuacion_satisfaccion": {
//       "metric_cy": 4.8,
//       "metric_ly": 5,
//       "metric_diff": -3.8
//     },
//     "clientes_por_mercado": [
//       { "country": "DE", "metric_cy": 421, "metric_ly": 425 },
//       { "country": "GB", "metric_cy": 242, "metric_ly": 236 },
//       { "country": "BE", "metric_cy": 89, "metric_ly": 77 },
//       { "country": "NL", "metric_cy": 44, "metric_ly": 77 },
//       { "country": "LU", "metric_cy": 24, "metric_ly": 37 },
//       { "country": "IT", "metric_cy": 12, "metric_ly": 4 }
//     ],
//     "ocupacion": { "metric_cy": 96 },
//     "altitude": 25,
//     "is3dmodel": true,
//     "centerLatitude": 28.095266632344742,
//     "centerLongitude": -16.746009168944557,
//     "heading": 180,
//     "range": 360
//   },
//   {
//     "hotel_id": 2801,
//     "hotel_name": "Hotel Riu Cancun",
//     "lat": 21.137658,
//     "long": -86.74813,
//     "total_clientes_hospedados": {
//       "metric_cy": 1685,
//       "metric_ly": 1748,
//       "metric_diff": -3.6
//     },
//     "reservas_usuarios_rc": {
//       "metric_cy": 65,
//       "metric_ly": 73.3,
//       "metric_diff": -11.4
//     },
//     "usuarios_repetidores": {
//       "metric_cy": 33.2,
//       "metric_ly": 28.6,
//       "metric_diff": 16.1
//     },
//     "puntuacion_satisfaccion": {
//       "metric_cy": 4.7,
//       "metric_ly": 4.2,
//       "metric_diff": 12.5
//     },
//     "clientes_por_mercado": [
//       { "country": "US", "metric_cy": 527, "metric_ly": 648 },
//       { "country": "GB", "metric_cy": 368, "metric_ly": 357 },
//       { "country": "MX", "metric_cy": 293, "metric_ly": 288 },
//       { "country": "CA", "metric_cy": 247, "metric_ly": 76 },
//       { "country": "AR", "metric_cy": 83, "metric_ly": 183 },
//       { "country": "CL", "metric_cy": 54, "metric_ly": 36 }
//     ],
//     "ocupacion": { "metric_cy": 91 },
//     "altitude": 10,
//     "is3dmodel": true,
//     "centerLatitude": 21.137667688585733,
//     "centerLongitude": -86.74827994602298,
//     "heading": 0,
//     "range": 360
//   },
//   {
//     "hotel_id": 563,
//     "hotel_name": "Hotel Riu Nautilus",
//     "lat": 36.6019768963,
//     "long": -4.50994251483,
//     "total_clientes_hospedados": {
//       "metric_cy": 611,
//       "metric_ly": 571,
//       "metric_diff": 7
//     },
//     "reservas_usuarios_rc": {
//       "metric_cy": 54.8,
//       "metric_ly": 58.5,
//       "metric_diff": -6.3
//     },
//     "usuarios_repetidores": {
//       "metric_cy": 71.1,
//       "metric_ly": 63.9,
//       "metric_diff": 11.3
//     },
//     "puntuacion_satisfaccion": {
//       "metric_cy": 4.7,
//       "metric_ly": 5,
//       "metric_diff": -6.7
//     },
//     "clientes_por_mercado": [
//       { "country": "GB", "metric_cy": 235, "metric_ly": 215 },
//       { "country": "DE", "metric_cy": 148, "metric_ly": 171 },
//       { "country": "BE", "metric_cy": 90, "metric_ly": 67 },
//       { "country": "NL", "metric_cy": 44, "metric_ly": 56 },
//       { "country": "IE", "metric_cy": 30, "metric_ly": 24 },
//       { "country": "LU", "metric_cy": 21, "metric_ly": 7 }
//     ],
//     "ocupacion": { "metric_cy": 96 },
//     "altitude": 15,
//     "is3dmodel": true,
//     "centerLatitude": 36.60209755609427,
//     "centerLongitude": -4.509757799146957,
//     "heading": 0,
//     "range": 360
//   }
// ]


    var lat_initial = 40.4240552;
    var lng_initial = -3.7112912;

    async function init() {
      const { Map3DElement, MapMode, Marker3DElement } =
        await google.maps.importLibrary("maps3d");

      const riuFlagImg1 = document.createElement("img");
      riuFlagImg1.src = "./assets/images/icons/map_markers/classic-outline.svg";
      const riuFlagImg2 = document.createElement("img");
      riuFlagImg2.src = "./assets/images/icons/map_markers/classic-outline.svg";
      const riuFlagImg3 = document.createElement("img");
      riuFlagImg3.src = "./assets/images/icons/map_markers/classic-outline.svg";

      const flyToCamera1 = {
        center: {
          lat: hotelDataRiu[0].centerLatitude,
          lng: hotelDataRiu[0].centerLongitude,
          altitude: hotelDataRiu[0].altitude,
        },
        heading: hotelDataRiu[0].heading,
        tilt: hotelDataRiu[0].is3dmodel ? 55 : 25,
        range: hotelDataRiu[0].range,
      };
      const markerWithLabel1 = new Marker3DElement({
        position: {
          lat: hotelDataRiu[0].lat,
          lng: hotelDataRiu[0].long,
        },
        label: hotelDataRiu[0].hotel_name,
      });
      const templateForImg = document.createElement("template");
      templateForImg.content.append(riuFlagImg1);
      markerWithLabel1.append(templateForImg);

      const flyToCamera2 = {
        center: {
          lat: hotelDataRiu[1].is3dmodel
            ? hotelDataRiu[1].centerLatitude
            : hotelDataRiu[1].lat,
          lng: hotelDataRiu[1].is3dmodel
            ? hotelDataRiu[1].centerLongitude
            : hotelDataRiu[1].long,
          altitude: hotelDataRiu[1].altitude,
        },
        heading: hotelDataRiu[1].heading,
        tilt: hotelDataRiu[1].is3dmodel ? 55 : 25,
        range: hotelDataRiu[1].range,
      };
      const markerWithLabel2 = new Marker3DElement({
        position: {
          lat: hotelDataRiu[1].lat,
          lng: hotelDataRiu[1].long,
        },
        label: hotelDataRiu[1].hotel_name,
      });
      const templateForImg2 = document.createElement("template");
      templateForImg2.content.append(riuFlagImg2);
      markerWithLabel2.append(templateForImg2);

      const flyToCamera3 = {
        center: {
          lat: hotelDataRiu[2].is3dmodel
            ? hotelDataRiu[2].centerLatitude
            : hotelDataRiu[2].lat,
          lng: hotelDataRiu[2].is3dmodel
            ? hotelDataRiu[2].centerLongitude
            : hotelDataRiu[2].long,
          altitude: hotelDataRiu[2].altitude,
        },
        heading: hotelDataRiu[2].heading,
        tilt: hotelDataRiu[2].is3dmodel ? 55 : 25,
        range: hotelDataRiu[2].range,
      };
      const markerWithLabel3 = new Marker3DElement({
        position: {
          lat: hotelDataRiu[2].lat,
          lng: hotelDataRiu[2].long,
        },
        label: hotelDataRiu[2].hotel_name,
      });
      const templateForImg3 = document.createElement("template");
      templateForImg3.content.append(riuFlagImg3);
      markerWithLabel3.append(templateForImg3);

      const map = new Map3DElement({
        center: { lat: lat_initial, lng: lng_initial, altitude: 19170000 },
        mode: MapMode.SATELLITE,
        defaultUIDisabled: true,
      });

      map3D.appendChild(map);

      setTimeout(() => {
        map.append(markerWithLabel1);
        map.flyCameraTo({
          endCamera: flyToCamera1,
          durationMillis: 12000,
        });
        map.addEventListener(
          "gmp-animationend",
          () => {
            map.flyCameraAround({
              camera: flyToCamera1,
              durationMillis: 20000,
              rounds: 0.35,
            });
          },
          { once: true }
        );

        setTimeout(() => {
          map.append(markerWithLabel2);
          map.flyCameraTo({
            endCamera: flyToCamera2,
            durationMillis: 12000,
          });
          map.addEventListener(
            "gmp-animationend",
            () => {
              map.flyCameraAround({
                camera: flyToCamera2,
                durationMillis: 20000,
                rounds: 0.35,
              });
            },
            { once: true }
          );

          setTimeout(() => {
            map.append(markerWithLabel3);
            map.flyCameraTo({
              endCamera: flyToCamera3,
              durationMillis: 12000,
            });
            map.addEventListener(
              "gmp-animationend",
              () => {
                map.flyCameraAround({
                  camera: flyToCamera3,
                  durationMillis: 20000,
                  rounds: 0.35,
                });
              },
              { once: true }
            );

            setTimeout(() => {
              map.flyCameraTo({
                endCamera: {
                  center: {
                    lat: lat_initial,
                    lng: lng_initial,
                    altitude: 19170000,
                  },
                },
                durationMillis: 8000,
              });

              setTimeout(() => {
                setTimeout(function () {
                  map3D.classList.remove("active");
                  setTimeout(function () {
                    screenMap3D.classList.remove("fullscreen");
                    setTimeout(function () {
                      document
                        .getElementsByClassName("wrapper__maps")[0]
                        .classList.remove("w-full");
                    }, 2500);
                  }, 2000);
                }, 500);
              }, 6000);
            }, 34000);

            setTimeout(() => {
              document
                .querySelector(".metrics.metrics__view--6")
                .classList.add("active-hotel");
              document
                .querySelector(".metrics.metrics__view--6 .metrics__hotel3")
                .classList.add("active-hotel");
              document
                .querySelector(
                  ".metrics.metrics__view--6 .metrics_image--hotel_3"
                )
                .classList.add("active-hotel");
            }, 11000);
            setTimeout(() => {
              document
                .querySelector(".metrics.metrics__view--6")
                .classList.remove("active-hotel");
              setTimeout(() => {
                document
                  .querySelector(".metrics.metrics__view--6 .metrics__hotel3")
                  .classList.remove("active-hotel");
                document
                  .querySelector(
                    ".metrics.metrics__view--6 .metrics_image--hotel_3"
                  )
                  .classList.remove("active-hotel");
              }, 1500);
            }, 34000);
          }, 34000);

          setTimeout(() => {
            document
              .querySelector(".metrics.metrics__view--6")
              .classList.add("active-hotel");
            document
              .querySelector(".metrics.metrics__view--6 .metrics__hotel2")
              .classList.add("active-hotel");
            document
              .querySelector(
                ".metrics.metrics__view--6 .metrics_image--hotel_2"
              )
              .classList.add("active-hotel");
          }, 11000);
          setTimeout(() => {
            document
              .querySelector(".metrics.metrics__view--6")
              .classList.remove("active-hotel");
            setTimeout(() => {
              document
                .querySelector(".metrics.metrics__view--6 .metrics__hotel2")
                .classList.remove("active-hotel");
              document
                .querySelector(
                  ".metrics.metrics__view--6 .metrics_image--hotel_2"
                )
                .classList.remove("active-hotel");
            }, 1500);
          }, 34000);
        }, 34000);

        setTimeout(() => {
          document
            .querySelector(".metrics.metrics__view--6")
            .classList.add("active-hotel");
          document
            .querySelector(".metrics.metrics__view--6 .metrics__hotel1")
            .classList.add("active-hotel");
          document
            .querySelector(".metrics.metrics__view--6 .metrics_image--hotel_1")
            .classList.add("active-hotel");
        }, 9000);
        setTimeout(() => {
          document
            .querySelector(".metrics.metrics__view--6")
            .classList.remove("active-hotel");
          setTimeout(() => {
            document
              .querySelector(".metrics.metrics__view--6 .metrics__hotel1")
              .classList.remove("active-hotel");
            document
              .querySelector(
                ".metrics.metrics__view--6 .metrics_image--hotel_1"
              )
              .classList.remove("active-hotel");
          }, 1500);
        }, 34000);
      }, 2000);
    }
    init();
  }

  setTimeout(function () {
    document.getElementsByClassName("wrapper__maps")[0].classList.add("w-full");
    setTimeout(function () {
      screenMap3D.classList.add("fullscreen");
      setTimeout(function () {
        map3D.classList.add("active");
        load3DMap();
      }, 2500);
    }, 2000);
  }, 500);
}
