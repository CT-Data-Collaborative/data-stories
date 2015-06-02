$.getJSON("static/data/towns_with_stops.geojson", function(data) {

        function style(feature) {
          console.log(feature);
          return {
            opacity: 1,
            weight: 1,
            color: 'white',
            fillOpacity: 0.9,
            fillColor: 'blue'
          };
        }

        townJSON = L.geoJson(data, {style: style});
        var tileLayer = new L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
            attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          });
        var map = new L.map('townmap', {zoomControl: false}).setView([41.5013,-72.8325],8);
        tileLayer.addTo(map);
        townJSON.addTo(map);
      });
