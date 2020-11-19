// Start imports
import {
    getDistinctValuesFromObject,
    getValuesFromObject
} from './utils.js'

// Aside LOCATIONS
// ============================

// Depracated
let getUserData = async () => {
    let response = await fetch("/api/v3/get-user-data")
    let json = response.json()
    return json
}

(async () => {
    // let userData = await getUserData()
    let userData = userData_raw

    const zoneEl = $("#zones-list")
    const sensorAlertEl = $("#sensor-alert")
    let unsetSensors = 0

    if (!userData['error']) {

        // [*] TODO: display multiple locationsÎ
        let location2 = getDistinctValuesFromObject('location2', userData).length
        let location1 = getDistinctValuesFromObject('location1', userData).length

        // console.log(location1, location2, location3, userData.length)

        let bufferAppendedLocations = []

        userData.forEach(user => {

            let aux_checker = JSON.stringify(bufferAppendedLocations);
            let aux_item = JSON.stringify([user.location1, user.location2, user.location3]);
            let hasBeenAppended = aux_checker.indexOf(aux_item)

            if (user.zoneId == 1) {
                // TODO: warning message for unset sensors
                // TIP: normally this shouldnt exists because sensors are assignated when zone is set
                unsetSensors++;
            } else if (hasBeenAppended == -1) {

                bufferAppendedLocations.push([user.location1, user.location2, user.location3])

                let name
                // if (location1 > 1) // when there are > 1 counties / regions and not matter how many cities
                //     name = `<span class='multi-location'>` + user.location3 + `<span class='location-detail'>` + user.location1 + `, ` + user.location2 + `</span>` + `</span>`
                // else if (location1 == 1 && location2 > 1) // when there is one county and more cities
                //     name = `<span class='multi-location'>` + user.location3 + `<span class='location-detail'>` + user.location2 + `</span>` + `</span>`
                // else
                //     name = `<span class=''>` + user.location3 + `</span>`
                name = `<span class='multi-location'>`+user.location3+`<span class='location-detail'>`+user.location2+`</span>`+`</span>`

                zoneEl.append(`<div class="zone-item">
                                <a href="/map/zone?zoneid=` + user.zoneId + `" class='county-item'><i class="fas fa-layer-group"></i>` + name + `</a>
                            </div>`)
            }
        })

        // console.log(bufferAppendedLocations)
    }

    if (unsetSensors) {
        zoneEl.append(`<div class="zone-item">
                        <a href="/set-location" class='no-zone'><i class="fas fa-exclamation-circle"></i><span>You have ` + unsetSensors + ` new sensors</span></a>
                    </div>`)
    } else if (zoneEl.children().length == 0) {
        zoneEl.append(`<div class="zone-item">
                        <a href="#" class='no-zone'><i class="fas fa-exclamation-circle"></i><span>No sensors available</span></a>
                    </div>`)
    }

})().then(() => {
    let hrefZone = window.location.href
    let zoneItem = $(".zone-item a[href]")
    // console.log(zoneItem.length)
    for (let i = 0; i < zoneItem.length; i++) {
        // console.log(zoneItem[i].href, hrefZone)
        if (zoneItem[i].href == hrefZone) {
            zoneItem[i].classList.add('link-selected')
        }
    }
})
// ============================
// END Aside LOCATIONS

// Aside MAPS
// ============================

// [ ] TODO: choose userData or userData_row for maps and locations

// let maps = getValuesFromObject('map', userData_raw)
let zones = getValuesFromObject('zoneId', userData_raw)
let location1 = getValuesFromObject('location1', userData_raw)
let location2 = getValuesFromObject('location2', userData_raw)
let location3 = getValuesFromObject('location3', userData_raw)

// [*] TODO: display multiple maps

let bufferAppendedMaps = []
// console.log(zones)
zones.forEach((id, index) => {

    // Check double append
    let aux_checker = JSON.stringify(bufferAppendedMaps);
    let aux_item = JSON.stringify([location3[index], location2[index], location1[index]]);
    let hasBeenAppended = aux_checker.indexOf(aux_item)

    if (hasBeenAppended == -1) {
        bufferAppendedMaps.push([location3[index], location2[index], location1[index]])
        let mapsEl = $("#mySidenav #maps-list")
        let name = `<span class='multi-location'>Map ` + location3[index] + `<span class='location-detail'>` + location2[index] + `</span>` + `</span>`
        mapsEl.append(`<div class="map-item">
                            <a href="/map?id=` + id + `" class='map-button'>
                            <i class="fas fa-map-marked"></i>
                                ` + name + `
                            </a>
                        </div>`)
    }
})

// Color yellow menu item
let href = window.location.href
let mapItem = $(".map-item a[href]")
for (let i = 0; i < mapItem.length; i++) {
    if (mapItem[i].href == href) {
        mapItem[i].classList.add('link-selected')
    }
}
// ============================
// END Aside maps


// Aside height
// ============================
let getOffset = () => {
    let brandH = $(".sidenav-wrapper .brand").outerHeight();
    let settingsH = $(".sidenav-wrapper .settings-items").outerHeight()
    return brandH + settingsH
}
let getRemainingHeight = () => {
    let sideH = $("#mySidenav").outerHeight()
    // let sideH = window.outerHeight
    let offset = getOffset()
    return sideH - offset
}
let setHeight = () => {
    let freeSpace = getRemainingHeight()
    $("#maps-list").css({"max-height":freeSpace/2})
    $("#zones-list").css({"max-height":freeSpace/2})
}
$(window).on('load resize',()=>{
    // setHeight()
})
// ============================
// END Aside height
