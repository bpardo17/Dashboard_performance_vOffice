import { initializeMapWeb } from "./map_visitas-web.js";
import { initializeMapApp } from "./map_app.js";
import { initializeMapReservas } from "./map_reservas.js";
import { initializeMapReservasTotales } from "./map_reservas_totales.js";
import { initializeMapClientes } from "./map_cliente.js";
import { initializeMap3D } from "./map_gm3d.js";

(function () {
  getData(); // Llamamos a la función getData() para obtener los datos al cargar la página.
  getDataHotel(); // Llamamos a la función getDataHotel() para obtener los datos al cargar la página.
  mergeDataHotel(); // Llamamos a la función getDataHotel() para obtener los datos al cargar la página.

  var tabChangeTime = 15000; // Tiempo de cambio de pestaña en milisegundos, también aplica como reset de los intervalos de cambio de slider.
  var tabChangeTime3D = 122000; // Tiempo de cambio de slider en milisegundos.

  //var tabChangeTime = 5000; // Tiempo de cambio de pestaña en milisegundos, también aplica como reset de los intervalos de cambio de slider.
  //var tabChangeTime3D = 122000; // Tiempo de cambio de slider en milisegundos.

  let sliderInterval; // Variable para almacenar el intervalo de cambio de slider.
  let sliderNextInterval; // Variable para almacenar el intervalo de cambio de cada item del slider.
  let showViewInterval; // Variable para almacenar el intervalo de showView

  // Inicializamos el mapa de visitas web al cargar la página añadiendo un delay de 2 segundos para que se cargue el mapa y no se pise la aparición de los bullets points.
  document.addEventListener("DOMContentLoaded", function () {
    clearSliderFunc();
    sliderFunc(1);
    setTimeout(function () {
      initializeMapWeb();
    }, 2000);
    sliderInterval = setInterval(() => sliderFunc(1), tabChangeTime); // Inicializamos el intervalo de cambio de slider.
  });

  // Función para limpiar los intervalos de cada slider y de cada item del mismo.
  function clearSliderFunc() {
    if (sliderInterval) {
      clearInterval(sliderInterval);
      sliderInterval = null;
    }
    if (sliderNextInterval) {
      clearInterval(sliderNextInterval);
      sliderNextInterval = null;
    }
  }

  /** OBTENEMOS LA HORA PARA PINTARLA EN EL TOP DE LA PÁGINA */
  function getFormattedDateTime() {
    const now = new Date();

    // Días de la semana
    const days = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];

    // Meses del año
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    // Extraémos los datos
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    // Formateamos la salida.
    return `${day} ${date} de ${month} ${hours}:${minutes}:${seconds}`;
  }

  function get_parent(node, selector) {
    return node.closest(selector);
  }

  function clearClasses() {
    Array.from(document.querySelectorAll(".metrics__row")).forEach((el) =>
      el.classList.remove("isHidden")
    );
  }

  function onClassChange(node, callback) {
    let lastClassString = node.classList.toString();

    const mutationObserver = new MutationObserver((mutationList) => {
      for (const item of mutationList) {
        if (item.attributeName === "class") {
          const classString = node.classList.toString();
          if (classString !== lastClassString) {
            callback(mutationObserver);
            lastClassString = classString;
            break;
          }
        }
      }
    });

    mutationObserver.observe(node, { attributes: true });

    return mutationObserver;
  }

  // Hacemos un fetch del endpoint que nos devuelve todos los datos.
  async function getData() {
    try {
      const response = await fetch(
        "https://europe-west1-bq-consumer-riu-api.cloudfunctions.net/get_monitor_data"
      );

      // Comentar esta constante cuando se quiera hacer lectura de datos desde el json en vivo y descomentar las lineas 54, 55 y 56
      // const response = await fetch(
      //   "/sample-data.json"
      // );
      // Leemos primero el json en formato texto para poder convertir NaN a null, porque sino la llamada al json falla.
      const text = await response.text();
      // Convertimos NaN en "-" para evitar que la respuesta del endpoint de un fallo.
      const formatText = text.replace(/\bNaN\b/g, "null");
      // Obtenemos el json sin fallos de formato.
      const data = JSON.parse(formatText);
      localStorage.setItem("dataMetrics", JSON.stringify(data));
    } catch (error) {
      console.error("HAY UN ERROR EN EL ENDPOINT: " + error);
    }
  }

  async function getDataHotel() {
    try {
      // const response = await fetch(
      //   "https://europe-west1-bq-consumer-riu-api.cloudfunctions.net/get_monitor_data"
      // );

      // Comentar esta constante cuando se quiera hacer lectura de datos desde el json en vivo y descomentar las lineas 54, 55 y 56
      const response = await fetch(
        "./hotel-data.json"
        //"https://europe-west1-bq-consumer-riu-api.cloudfunctions.net/get_monitor_data"
      );
      // Leemos primero el json en formato texto para poder convertir NaN a null, porque sino la llamada al json falla.
      const text = await response.text();
      // Convertimos NaN en "-" para evitar que la respuesta del endpoint de un fallo.
      const formatText = text.replace(/\bNaN\b/g, "null");
      // Obtenemos el json sin fallos de formato.
      const data = JSON.parse(formatText);
      localStorage.setItem("dataHotels", JSON.stringify(data));
    } catch (error) {
      console.error("HAY UN ERROR EN EL ENDPOINT: " + error);
    }
  }

  async function mergeDataHotel() {
    try {
      const dataMetrics = JSON.parse(localStorage.getItem("dataMetrics"));
      const dataHotels = JSON.parse(localStorage.getItem("dataHotels"));

      if (dataMetrics && dataHotels) {
        const mergedData = dataMetrics.info_hotel_google_maps.map((metric) => {
          const hotelInfo = dataHotels.info_hotel_google_maps.find(
            (hotel) => hotel.hotel_id === metric.hotel_id
          );
          return {
            ...metric,
            altitude: hotelInfo ? hotelInfo.altitude : null,
            is3dmodel: hotelInfo ? hotelInfo.is3dmodel : null,
            centerLatitude: hotelInfo ? hotelInfo.centerLatitude : null,
            centerLongitude: hotelInfo ? hotelInfo.centerLongitude : null,
            heading: hotelInfo ? hotelInfo.heading : null,
            range: hotelInfo ? hotelInfo.range : null,
          };
        });

        localStorage.setItem("mergedData", JSON.stringify(mergedData));
      }
    } catch (error) {
      console.error("Error merging data:", error);
    }
  }

  async function getRandomDataHotel() {
    try {
      const dataHotels = await JSON.parse(localStorage.getItem("mergedData"));
      /*var dataHotels = [
        {
          hotel_id: 5831,
          hotel_name: "Hotel Riu Plaza Fisherman's Wharf",
          lat: 37.807603,
          long: -122.413741,
          total_clientes_hospedados: {
            metric_cy: 1398,
            metric_ly: 1298,
            metric_diff: 7.7,
          },
          reservas_usuarios_rc: {
            metric_cy: 50,
            metric_ly: 52.5,
            metric_diff: -4.8,
          },
          usuarios_repetidores: {
            metric_cy: 18,
            metric_ly: 19,
            metric_diff: -5.3,
          },
          puntuacion_satisfaccion: {
            metric_cy: 4.7,
            metric_ly: 5,
            metric_diff: -5.6,
          },
          clientes_por_mercado: [
            { country: "US", metric_cy: 870, metric_ly: 552 },
            { country: "GB", metric_cy: 90, metric_ly: 172 },
            { country: "MX", metric_cy: 71, metric_ly: 15 },
            { country: "CA", metric_cy: 58, metric_ly: 21 },
            { country: "ES", metric_cy: 42, metric_ly: 296 },
            { country: "DE", metric_cy: 42, metric_ly: 36 },
          ],
          ocupacion: { metric_cy: 98 },
          altitude: 5,
          is3dmodel: true,
          centerLatitude: 37.80717310435171,
          centerLongitude: -122.41297593339426,
          heading: 90,
          range: 300,
        },
        {
          hotel_id: 1334,
          hotel_name: "Hotel Riu Madeira",
          lat: 32.645934,
          long: -16.826939,
          total_clientes_hospedados: {
            metric_cy: 770,
            metric_ly: 704,
            metric_diff: 9.4,
          },
          reservas_usuarios_rc: {
            metric_cy: 100,
            metric_ly: 100,
            metric_diff: 0,
          },
          usuarios_repetidores: {
            metric_cy: 45.2,
            metric_ly: 45.3,
            metric_diff: -0.2,
          },
          puntuacion_satisfaccion: {
            metric_cy: 5,
            metric_ly: 4.5,
            metric_diff: 11.1,
          },
          clientes_por_mercado: [
            { country: "DE", metric_cy: 330, metric_ly: 327 },
            { country: "GB", metric_cy: 274, metric_ly: 229 },
            { country: "LU", metric_cy: 30, metric_ly: 28 },
            { country: "SE", metric_cy: 23, metric_ly: 11 },
            { country: "FR", metric_cy: 20, metric_ly: 24 },
            { country: "FI", metric_cy: 18, metric_ly: 0 },
          ],
          ocupacion: { metric_cy: 99 },
          altitude: 20,
          is3dmodel: true,
          centerLatitude: 32.64566666855348,
          centerLongitude: -16.826816160308276,
          heading: 290,
          range: 360,
        },
        {
          hotel_id: 1601,
          hotel_name: "Hotel Riu Plaza London Victoria",
          lat: 51.494433,
          long: -0.142072,
          total_clientes_hospedados: {
            metric_cy: 1031,
            metric_ly: 979,
            metric_diff: 5.3,
          },
          reservas_usuarios_rc: {
            metric_cy: 85.7,
            metric_ly: 54.8,
            metric_diff: 56.4,
          },
          usuarios_repetidores: {
            metric_cy: 26.8,
            metric_ly: 24,
            metric_diff: 11.7,
          },
          puntuacion_satisfaccion: {
            metric_cy: 4.4,
            metric_ly: 4.1,
            metric_diff: 7.5,
          },
          clientes_por_mercado: [
            { country: "US", metric_cy: 288, metric_ly: 376 },
            { country: "GB", metric_cy: 207, metric_ly: 190 },
            { country: "ES", metric_cy: 160, metric_ly: 58 },
            { country: "DE", metric_cy: 49, metric_ly: 74 },
            { country: "IT", metric_cy: 46, metric_ly: 23 },
            { country: "FR", metric_cy: 26, metric_ly: 26 },
          ],
          ocupacion: { metric_cy: 95 },
          altitude: 5,
          is3dmodel: true,
          centerLatitude: 51.494458741193,
          centerLongitude: -0.14201950795036744,
          heading: 120,
          range: 360,
        },
      ];*/

      if (dataHotels) {
        var only3Dmaps = dataHotels.filter((hotel) => hotel.is3dmodel);
        const randomHotels = [];
        const hotelCount = only3Dmaps.length;
        //const randomHotels = [];
        //const hotelCount = dataHotels.length;
        while (randomHotels.length < 3 && randomHotels.length < hotelCount) {
          const randomIndex = Math.floor(Math.random() * hotelCount);
          const randomHotel = only3Dmaps[randomIndex];
          //const randomHotel = dataHotels[randomIndex];
          if (!randomHotels.includes(randomHotel)) {
            randomHotels.push(randomHotel);
          }
        }
        localStorage.setItem("randomHotels", JSON.stringify(randomHotels));
      }
    } catch (error) {
      console.error("Error getting random hotels:", error);
    }
  }

  /*setTimeout(function(){
    var slider = document.querySelector('.metrics__view--1 .metric__wrap--slider');
    slider.style.transform = `translateX(-${33}%)`;
  }, 3000);*/
  // if(document.querySelector('.metrics__view--1').classList.contains('show')){
  //   let sliderIndex = 1;
  //   setInterval(function(){
  //     if(sliderIndex == 4){
  //       sliderIndex = 0;
  //     }
  //     let slider = document.querySelector('.metrics__view--1 .metric__wrap--slider');
  //     slider.style.transform = `translateX(-${33*sliderIndex}%)`;
  //     sliderIndex++;
  //   },4000);
  // }

  // Función para que el listado de métricas por país tenga movimiento.
  function sliderFunc(currentMetric) {
    let sliderBox = document.querySelector(
      `.metrics__view--${currentMetric} .metric__wrap--slider`
    );
    if (sliderBox != null) {
      sliderBox.style.left = `0%`;
      let index = 0;
      let currentLeftPosition = 0;
      let nextLeftPosition = -33.3;
      while (sliderBox.children.length > 6) {
        sliderBox.removeChild(sliderBox.lastChild);
      }
      // Función que clona cada item del slider y lo mueve a la derecha simulando un loop.
      function sliderNext() {
        index++;
        setTimeout(() => {
          let child = sliderBox.querySelector(
            `.metrics__card--individual:nth-child(${index})`
          );
          let cloneNode = child.cloneNode(true);
          sliderBox.style.width = `33.3%`;
          sliderBox.appendChild(cloneNode);
        }, 300);
        // Si llegamos al final del slider, reseteamos el index y volvemos a la posición inicial.
        if (index === 1) {
          currentLeftPosition = 0;
          nextLeftPosition = 0;
          sliderBox.style.left = "-33.3%";
        } else {
          currentLeftPosition = sliderBox.style.left
            ? parseFloat(sliderBox.style.left.replace("%", ""))
            : 0;
          nextLeftPosition = currentLeftPosition - 33.3;
          sliderBox.style.left = `${nextLeftPosition}%`;
        }
      }
      // Llamamos a la función cada 3.2 segundos para que se mueva los items del slider.
      sliderNextInterval = setInterval(function () {
        sliderNext();
      }, 3200);
    }
  }

  function sliderFuncHotel(currentHotel) {
    let sliderBox = document.querySelector(
      `.metrics__view--6 .metrics__hotel${currentHotel} .metric__wrap--slider`
    );
    if (sliderBox != null) {
      sliderBox.style.left = `0%`;
      let index = 0;
      let currentLeftPosition = 0;
      let nextLeftPosition = -33.3;
      while (sliderBox.children.length > 6) {
        sliderBox.removeChild(sliderBox.lastChild);
      }
      // Función que clona cada item del slider y lo mueve a la derecha simulando un loop.
      function sliderNext() {
        index++;
        setTimeout(() => {
          let child = sliderBox.querySelector(
            `.metrics__card--individual:nth-child(${index})`
          );
          let cloneNode = child.cloneNode(true);
          sliderBox.style.width = `33.3%`;
          sliderBox.appendChild(cloneNode);
        }, 300);
        // Si llegamos al final del slider, reseteamos el index y volvemos a la posición inicial.
        if (index === 1) {
          currentLeftPosition = 0;
          nextLeftPosition = 0;
          sliderBox.style.left = "-33.3%";
        } else {
          currentLeftPosition = sliderBox.style.left
            ? parseFloat(sliderBox.style.left.replace("%", ""))
            : 0;
          nextLeftPosition = currentLeftPosition - 33.3;
          sliderBox.style.left = `${nextLeftPosition}%`;
        }
      }
      // Llamamos a la función cada 3.2 segundos para que se mueva los items del slider.
      sliderNextInterval = setInterval(function () {
        sliderNext();
        console.log("Slide moving");
        //debugger; // Debugger para pausar la ejecución del slider de nacionalidades dentro de cada vista hotel 3D.
      }, 3200);
    }
  }

  // Actualización en tiempo real
  function updateDateTime() {
    const dateTimeElement = document.getElementById("currentDateTime");
    if (dateTimeElement) {
      dateTimeElement.textContent = getFormattedDateTime();
    }
  }

  // Actualiza cada segundo
  setInterval(updateDateTime, 1000);

  // Llama a la función encargada de pintar la hora al cargar la página
  updateDateTime();

  let index = 1; // Índice del elemento actualmente visible
  const totalViews = 6; // Total de elementos

  function showView() {
    // Obtenemos el índice del próximo elemento.
    const nextIndex = index === totalViews ? 1 : index + 1;

    /** START TABS */
    var currentTab = document.querySelector(".tab__view--" + index);
    var nextTab = document.querySelector(".tab__view--" + nextIndex);

    currentTab.classList.add("no-active");
    currentTab.classList.remove("active");
    nextTab.classList.add("active");
    setTimeout(function () {
      currentTab.classList.add("invisible");
      currentTab.classList.add("no-active");
      setTimeout(function () {
        currentTab.classList.remove("no-active");
        setTimeout(function () {
          currentTab.classList.remove("invisible");
        }, 100);
      }, 750);
    }, 750);

    /** END TABS */

    /** START MAPS */
    const currentMap = document.querySelector(".map__ball--" + index);
    const nextMap = document.querySelector(".map__ball--" + nextIndex);

    currentMap.classList.remove("fade--in");
    nextMap.classList.add("fade--in");
    /** END MAPS */

    /** START VIEWS */

    // Obtenemos los elementos actual y siguiente.
    const currentView = document.querySelector(".metrics__view--" + index);
    const nextView = document.querySelector(".metrics__view--" + nextIndex);

    // Añadimos la clase left al elemento actual para que empiece su animación de fadeout hacia la izquierda.
    currentView.classList.add("left");
    // Eliminamos la clase hidden para poder aplicar las animaciones de aparición al próximo elemento.
    nextView.classList.remove("hidden");

    setTimeout(() => {
      // Después de medio segundo de la ejecución de lo anterior, añadimos y eliminamos clases a los elementos según convenga para aplicar las animaciones correspondientes.
      currentView.classList.remove("show");
      currentView.classList.add("hidden", "right");
      currentView.classList.remove("left");
      nextView.classList.remove("right");
      nextView.classList.add("show");
    }, 500);
    /*if(index == 2){
      return false;
    }*/
    /** END VIEWS */

    // sumamos 1 al índice.
    index = nextIndex;
    // Inicializamos los mapas según la vista en la que estemos.
    document.querySelector(".wrapper__metrics").classList.remove("hotel-view");
    if (index == 1) {
      clearInterval(showViewInterval);
      showViewInterval = setInterval(showView, tabChangeTime);
      clearSliderFunc();
      sliderFunc(index);
      setTimeout(function () {
        initializeMapWeb();
      }, 2000); // Añadimos 2 segundos de delay para que se cargue el mapa.
      sliderInterval = setInterval(sliderFunc, tabChangeTime);
    }
    if (index == 2) {
      clearSliderFunc();
      sliderFunc(index);
      setTimeout(function () {
        initializeMapApp();
      }, 2000); // Añadimos 2 segundos de delay para que se cargue el mapa.
      sliderInterval = setInterval(sliderFunc, tabChangeTime);
    }
    if (index == 3) {
      clearSliderFunc();
      sliderFunc(index);
      setTimeout(function () {
        initializeMapReservas();
      }, 2000); // Añadimos 2 segundos de delay para que se cargue el mapa.
      sliderInterval = setInterval(sliderFunc, tabChangeTime);
    }
    if (index == 4) {
      clearSliderFunc();
      sliderFunc(index);
      setTimeout(function () {
        initializeMapReservasTotales();
      }, 2000); // Añadimos 2 segundos de delay para que se cargue el mapa.
      sliderInterval = setInterval(sliderFunc, tabChangeTime);
    }
    if (index == 5) {
      clearSliderFunc();
      sliderFunc(index);
      setTimeout(function () {
        // En cuanto el índice sea 4 (es decir, la última vista, llamamos a getData() para volver a hacer un fetch de los datos. Lo hacemos en la vista 4 y no en la 1 como sería lógico, para evitar que se congelen los datos durante 5 o 10 segundos.)
        initializeMapClientes();
      }, 2000); // Añadimos 2 segundos de delay para que se cargue el mapa.
      sliderInterval = setInterval(sliderFunc, tabChangeTime);
      getRandomDataHotel();
      clearClasses();
      setTimeout(setHotelDetailLabels, 1000);
    }
    if (index == 6) {
      clearInterval(showViewInterval);
      showViewInterval = setInterval(showView, tabChangeTime3D);
      clearSliderFunc();
      initializeMap3D();
      sliderInterval = setInterval(sliderFunc, tabChangeTime);
      getData();
      // Añadimos la clase hotel-view a la clase padre container_metrics cuando empieza la vista para hoteles 3D
      setTimeout(function () {
        document.querySelector(".wrapper__metrics").classList.add("hotel-view");
      }, 2000);
      onClassChange(document.querySelector(".metrics__hotel1"), () => {
        if (document.querySelector(".metrics__hotel1.active-hotel")) {
          clearSliderFunc();
          sliderFuncHotel(1);
          sliderInterval = setInterval(sliderFunc, tabChangeTime);
        }
      });
      onClassChange(document.querySelector(".metrics__hotel2"), () => {
        if (document.querySelector(".metrics__hotel2.active-hotel")) {
          clearSliderFunc();
          sliderFuncHotel(2);
          sliderInterval = setInterval(sliderFunc, tabChangeTime);
        }
      });
      onClassChange(document.querySelector(".metrics__hotel3"), () => {
        if (document.querySelector(".metrics__hotel3.active-hotel")) {
          clearSliderFunc();
          sliderFuncHotel(3);
          sliderInterval = setInterval(sliderFunc, tabChangeTime);
        }
      });
      // Eliminamos la clase hotel-view a la clase padre container_metrics cuando termina la vista para hoteles 3D
      /*setTimeout(function(){
        document.querySelector('.wrapper__metrics').classList.remove('hotel-view');
      }, 2000);*/
    }
  }

  // Ejecutamos la función cada X segundos"
  showViewInterval = setInterval(() => {
    showView();
    if (index === 6) {
      clearInterval(showViewInterval);
      showViewInterval = setInterval(showView, tabChangeTime3D);
    }
  }, tabChangeTime);

  function setLabels() {
    var secureDataRiu = JSON.parse(localStorage.getItem("dataMetrics"));
    var arrayMetrics = document.querySelectorAll(".id_metric");
    for (var i = 0; i < arrayMetrics.length; i++) {
      var element = arrayMetrics[i];
      var elementAttrs = element.getAttribute("data-json");
      //element.innerHTML = secureDataRiu.elementAttrs;
      var value = elementAttrs
        ?.split(".")
        .reduce((obj, key) => obj && obj[key], secureDataRiu);
      if (elementAttrs?.includes("diff")) {
        if (value > 0) {
          element
            .closest(".metrics__card-diff")
            .classList.add("metrics__card-diff--up");
          element.innerHTML = "+" + value + " %";
        } else if (value < 0) {
          element
            .closest(".metrics__card-diff")
            .classList.add("metrics__card-diff--down");
          element.innerHTML = value + " %";
        } else {
          element
            .closest(".metrics__card-diff")
            .classList.add("metrics__card-diff--equal");
          element.innerHTML = value + " %";
        }
      } else {
        // Añadimos puntos a los miles.
        if (value > 999) {
          const formattedValue = new Intl.NumberFormat("de-DE").format(value);
          element.innerHTML = formattedValue;
        } else {
          if (isNaN(value)) {
            element.innerHTML = value;
          } else {
            element.innerHTML = Math.round(value * 100) / 100;
          }
        }
      }
    }

    // Para imágenes del país
    var arrayImgCountries = document.querySelectorAll(".img_country");
    for (var i = 0; i < arrayImgCountries.length; i++) {
      var element = arrayImgCountries[i];
      var elementAttrs = element.getAttribute("data-json");
      var value = elementAttrs
        ?.split(".")
        .reduce((obj, key) => obj && obj[key], secureDataRiu);
      element.src =
        "https://hatscripts.github.io/circle-flags/flags/" +
        value?.toLowerCase() +
        ".svg";
    }
  }

  function setHotelDetailLabels() {
    var secureDataRiu = JSON.parse(localStorage.getItem("randomHotels"));

    secureDataRiu.map((hotel, index) => {
      var hotelTitle = document.querySelector(`h3.hotel_name_${index + 1}`);
      if (hotelTitle) {
        hotelTitle.innerHTML = hotel.hotel_name;
      }

      // Modificamos la imagen del hotel.
      var hotelIMage = document.querySelector(
        `.metrics_image--hotel_${index + 1} img`
      );
      if (hotelIMage) {
        hotelIMage.setAttribute(
          "src",
          `https://www.riu.com/images/hotels/${hotel.hotel_id}-h.jpg`
        );
        // https://www.riu.com/images/hotels/102-h.jpg"
      }

      var arrayMetrics = document.querySelectorAll(`.id_metric_${index + 1}`);
      for (var i = 0; i < arrayMetrics.length; i++) {
        var element = arrayMetrics[i];
        var elementAttrs = element.getAttribute("data-json-hotel");
        //element.innerHTML = secureDataRiu.elementAttrs;
        var value = elementAttrs
          ?.split(".")
          .reduce((obj, key) => obj && obj[key], hotel);
        if (elementAttrs?.includes("diff")) {
          if (value > 0) {
            element
              .closest(".metrics__card-diff")
              .classList.add("metrics__card-diff--up");
            element.innerHTML = "+" + value + " %";
          } else if (value < 0) {
            element
              .closest(".metrics__card-diff")
              .classList.add("metrics__card-diff--down");
            element.innerHTML = value + " %";
          } else {
            element
              .closest(".metrics__card-diff")
              .classList.add("metrics__card-diff--equal");
            element.innerHTML = value + " %";
          }
        } else {
          // Añadimos puntos a los miles.
          if (value > 999) {
            const formattedValue = new Intl.NumberFormat("de-DE").format(value);
            element.innerHTML = formattedValue;
          } else {
            if (isNaN(value)) {
              element.innerHTML = value;
            } else {
              element.innerHTML = Math.round(value * 100) / 100;
            }
          }
        }

        if (value === undefined || value === null) {
          get_parent(element, ".metrics__row").classList.add("isHidden");
        }
      }

      // Para imágenes del país
      var arrayImgCountries = document.querySelectorAll(
        `.img_country_${index + 1}`
      );
      for (var i = 0; i < arrayImgCountries.length; i++) {
        var element = arrayImgCountries[i];
        var elementAttrs = element.getAttribute("data-json-hotel");
        var value = elementAttrs
          ?.split(".")
          .reduce((obj, key) => obj && obj[key], hotel);
        element.src =
          "https://hatscripts.github.io/circle-flags/flags/" +
          value?.toLowerCase() +
          ".svg";
      }
    });
  }

  setTimeout(setLabels, 1000);
})();