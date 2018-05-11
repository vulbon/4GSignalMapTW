(function () {
    var mapBounds = L.latLngBounds(L.latLng(21.88, 118.12), L.latLng(25.44, 122.49));

    var tileLayers = {
        nlscEmap: L.tileLayer("http://wmts.nlsc.gov.tw/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=EMAP&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png", {
            maxZoom: 20,
            attribution: "Map data &copy; <a href='http://maps.nlsc.gov.tw/' target='_blank'>國土測繪中心</a>-臺灣通用電子地圖"
        }),
        nlscImage: L.tileLayer("http://wmts.nlsc.gov.tw/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=PHOTO2&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png", {
            maxZoom: 20,
            attribution: "Map data &copy; <a href='http://maps.nlsc.gov.tw/' target='_blank'>國土測繪中心</a>-正射影像"
        }),
        osmCycle: L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
            subdomains: "abc",
            maxZoom: 20,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>'
        }),
        gsm: L.tileLayer("http://mt{s}.google.com/vt/x={x}&y={y}&z={z}", {
            subdomains: '0123',
            maxZoom: 20,
            attribution: "Map data &copy; <a href='http://maps.google.com' target='_blank'>GoogleStreetMap</a>"
        }),
        gim: L.tileLayer("http://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
            subdomains: '0123',
            maxZoom: 20,
            attribution: "Map data &copy; <a href='http://maps.google.com' target='_blank'>GoogleImages</a>"
        })
    };

    var imageLayers = {
        CH: L.imageOverlay("https://coverage.cht.com.tw/coverage/images/mobile/4g_tw.png", [[40.712216, -74.22655], [40.773941, -74.12544]]),
        FE: L.imageOverlay("https://www.fetnet.net/service/roadtestresult/signal/img/coverage4G.png", [[40.712216, -74.22655], [40.773941, -74.12544]]),
    };


    var map = L.map('map', {
        attributionControl: true,
        zoomControl: false,
        layers: tileLayers.nlscEmap
    }).fitBounds(mapBounds);

    // move zoom controller to bottom right
    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    // layers change
    L.control.layers({
        "臺灣通用電子地圖": tileLayers.nlscEmap,
        "正射影像": tileLayers.nlscImage,
        "OSM-CycleMap": tileLayers.osmCycle,
        "Google Street": tileLayers.gsm,
        "Google Image": tileLayers.gim
    }, null, { position: "bottomright" }).addTo(map);

    L.control.layers({
        "中華電信": imageLayers.CH,
        // "台灣大哥大": null,
        "遠傳電信": imageLayers.FE
    }, null, { position: "bottomright" }).addTo(map);

    // 定位
    // 因為這個搞https搞了好久啊!!
    var geolocationButton = {
        control: L.control({ position: "bottomright" }),
        opened: false
    };
    geolocationButton.control.onAdd = function (map) {
        var triggerButton = L.DomUtil.create("div", "leaflet-bar");
        triggerButton.style.backgroundImage = "url(geolocation.png)";
        triggerButton.style.backgroundSize = "14px 14px";
        triggerButton.style.width = "30px";
        triggerButton.style.height = "30px";
        triggerButton.style.backgroundRepeat = "no-repeat";
        triggerButton.style.backgroundPosition = "center";
        triggerButton.style.backgroundColor = "white";
        triggerButton.style.cursor = "pointer";

        L.DomEvent.addListener(triggerButton, 'click', function (e) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    map.setView([position.coords.latitude, position.coords.longitude]);
                    geolocationMarker.range([position.coords.latitude, position.coords.longitude], position.coords.accuracy);
                    geolocationMarker.go([position.coords.latitude, position.coords.longitude]);
                }, function (err) {
                    alert("無法取得您的目前位置");
                }, { timeout: 10000 });
            }
        });

        return triggerButton;
    }
    geolocationButton.control.addTo(map);

    var geolocationMarker = { //定位點以及周圍
        go: function (latlng) {
            var self = this;
            if (this.marker) {
                this.marker.setLatLng(latlng).addTo(this.layers);
            }
            else {
                this.marker = L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'pin_red.png',
                        iconSize: [40, 40],
                        iconAnchor: [20.5, 37],
                        popupAnchor: [0, 0]
                    })
                });

                var id = L.Util.stamp(this.marker)
                this.marker.on("click", function () {
                    self.remove();
                }).addTo(this.layers);
            }
        },
        range: function (latlng, radius) {
            var self = this;
            if (this.circle) {
                this.circle.setLatLng(latlng).setRadius(radius).addTo(this.layers);
            }
            else {
                this.circle = L.circle(latlng, radius);
                this.circle.setStyle({ color: "#00BCD4", fillColor: "#00BCD4" });
                var id = L.Util.stamp(this.circle);
                this.circle.on("click", function () {
                    self.remove();
                }).addTo(this.layers);
            }
            return this.circle.getBounds();
        },
        remove: function () {
            this.layers.clearLayers();
        },
        layers: L.layerGroup().addTo(map)
    };


})();