function distance(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function loadTable(userLat, userLng) {

    $("tbody").empty();

    $.getJSON("data.json", function (topSpots) {

        topSpots.forEach(spot => {
            const lat = spot.location[0];
            const lng = spot.location[1];
            spot.distance = distance(userLat, userLng, lat, lng);
        });

        topSpots.forEach(spot => {
            const name = spot.name;
            const description = spot.description;
            const lat = spot.location[0];
            const lng = spot.location[1];

            const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

            const row = `
                <tr>
                    <td>${name}</td>
                    <td>${description}</td>
                    <td>${spot.distance.toFixed(2)} miles</td>
                    <td>
                        <a class="button maps-button" href="${mapUrl}" target="_blank">
                         Open in Google Maps
                        </a>
                    </td>
                </tr>
            `;

            $("tbody").append(row);
        });
    });
}

$(document).ready(function () {

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            loadTable(pos.coords.latitude, pos.coords.longitude);
        },
        function () {
            loadTable(32.7157, -117.1611);
        }
    );

});

let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 32.7157, lng: -117.1611 }
    });

    $.getJSON("data.json", function (topSpots) {
        topSpots.forEach(spot => {
            const lat = spot.location[0];
            const lng = spot.location[1];

            const marker = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: spot.name
            });

            const info = new google.maps.InfoWindow({
                content: `
                    <strong>${spot.name}</strong><br>
                    ${spot.description}
                `
            });

            marker.addListener("mouseover", () => info.open(map, marker));
            marker.addListener("mouseout", () => info.close());
        });
    });
}
