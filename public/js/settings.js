// Imports
import {
    timeoutAsync,
    passwordChecker,
    passwordCheckerPromise,
    allTrue,
    getDistinctValuesFromObject,
    generateUniqueId,
    getValuesFromObject,
    getMultiReport,
    getDaysInMonth,
    monthChanger,
    _,
} from './utils.js'

// $(function () {
// document ready
// });

// [ ] TODO: get zones of comapny independetly
// [ ] TODO: get users of company
// [ ] TODO: get user that has access to zone

// Fetch
let fetchAdmins = async () => {
    let response = fetch('/api/get-team').then(result => {
        if (result.status != 200) { // user is not superadmin
            $(".admin-settings").remove()
        } else if (result.status == 200) {
            return result.json()
        }
    })
    return await response
}

// [ ] TODO: should get zones from sess.userData
// console.log("userData_raw", userData_raw)
let fetchZones = async () => {
    let response = fetch('/api/get-zones').then(result => {
        let resultJson = result.json()
        // console.log(await resultJson)
        if (result.status == 401) { // user is not superadmin
            $(".zone-settings").remove()
        } else if (result.status == 200) {
            return resultJson
        }
    })
    return await response
}

// console.log(userData)

// Color yellow setting item
if (window.location.href.indexOf('settings') > -1) {
    $(".settings-route").addClass("link-selected")
}

// ADMIN TAB
// ==============================

// Create admin button for modal
$(function () {
    $(`.create-admin`).on('click', function () {
        $(`#create-admin`).modal({
            backdrop: 'static'
        });
    });
});

// Append admin list
let company = ''
let listOfUsers
let fetchAdminsPromise = fetchAdmins().then(listOfAdmins => {
    // console.log(listOfAdmins)
    listOfUsers = listOfAdmins
    if (listOfAdmins != undefined) {
        listOfAdmins.forEach(admin => {

            // Add company in form
            if (!company) {
                company = admin.company
                $("#form-create-admin input[name='company']").attr("value", company) // Append company name in form
                $(".top-container span b").html(company) // Append company name in title for every box
            }

            if (admin.username == username)
                $(".admin-list table tbody").prepend(`<tr username='` + admin.username + `'>
                                                    <td><p>` + admin.name + `</p></td>
                                                    <td><p>` + admin.username + `</p></td>
                                                    <td><p>` + admin.email + `</p></td>
                                                    <td><span class='remove-user' username='` + admin.username + `'><i class="fas fa-user-minus"></i></span></td>
                                                </tr>`)
            else
                $(".admin-list table tbody").append(`<tr username='` + admin.username + `'>
                                                    <td><p>` + admin.name + `</p></td>
                                                    <td><p>` + admin.username + `</p></td>
                                                    <td><p>` + admin.email + `</p></td>
                                                    <td><span class='remove-user' username='` + admin.username + `'><i class="fas fa-user-minus"></i></span></td>
                                                </tr>`)

            $(".remove-user[username='" + admin.username + "']").on('click', (e) => {
                e.preventDefault();
                const username = admin.username
                const url = '/api/remove-user'
                // console.log(url, username)
                var ask = confirm("Do you want to REMOVE the user ?")
                if (ask)
                    $.ajax({
                        url,
                        type: 'POST',
                        data: { username },
                        success: function (result) {
                            if (result) {
                                $(`.admin-list tr[username='` + username + `']`).slideUp();
                            }
                        },
                        error: function (err) {
                            console.log("err:", err);
                        }
                    });
            })
        })
        listOfUsers = getDistinctValuesFromObject('username', listOfUsers)

        // Display superadmin in zones form or not ?Î
        // listOfUsers = listOfUsers.filter((user, index) => {
        //     return username == user ? false : user
        // })
    }

})

// END ADMIN TAB
// ==============================


// [ ] TODO: Append users checkbox in zoneModal

function getZones(user, obj) {
    let ids_raw = []
    obj.forEach(item => {
        if (item.username === user)
            ids_raw.push(item.zoneId)
    })
    return ids_raw
}

// Zone modal
let zoneModal = (id, zoneid, location1, location2, location3, custommap, olmap, path = '', listOfZoneAccess) => {
    // console.log(listOfZoneAccess)

    // [*] TODO: add unique users
    // [ ] TODO: isChecked

    // Checkbox for user list template
    let checkboxesTemplate = (name, username, checked) => {
        return '<label><input type="checkbox" ' + checked + ' name="' + name + '" value="' + username + '">' + username + '</label>'
    }

    // Init checkboxes
    let checkboxes_checked = ``
    let checkboxes_unchecked = ``
    let checkboxes = ``

    // Duplicate checker
    let usersUnchecked = []
    let usersChecked = []
    let userBuffer = []


    // } else {
    // There are some users for some zones
    listOfZoneAccess[1].forEach((location, index) => {
        if (location.zoneId == zoneid) {

            // Get row with this zone id from list of locations and users
            let zone = listOfZoneAccess[0].filter((location, idx) => {
                return location.zoneId == zoneid ? location : false
            })

            // console.log(zone[0])

            // If current zone has usersList
            if (zone[0]) {
                // Get unqiue users of it 
                let userAssignated = zone[0].usersList.split(',')
                userAssignated = new Set(userAssignated)

                // console.log(userAssignated)

                // Loop through each user and check who is assignated and who is not
                listOfUsers.forEach((user, index) => {
                    // console.log()
                    // if (index != 0) { // index != 0 because i dont want to show superadmin of this company
                    if (userAssignated.has(user)) {
                        checkboxes += checkboxesTemplate('username' + index, user, 'checked')
                    } else {
                        checkboxes += checkboxesTemplate('username' + index, user, '')
                    }
                    // }
                })
            } else { // if current zone has not an usersList
                listOfUsers.forEach((user, index) => {
                    // if (index != 0) { // index != 0 because i dont want to show superadmin of this company
                    checkboxes += checkboxesTemplate('username' + index, user, '')
                    // }
                })
            }

        }
    })
    // }

    // Modal Template
    return `<div class='zone-modal' modalid='` + id + `'>
            <div class="modal modal-zone" id="edit-zone-modal-`+ id + `" aria-labelledby="edit-zone-label"
                aria-hidden="true" tabindex="-1" role="dialog">
                <div class="modal-dialog fadeInModal modal-dialog-centered" role="document">
                    <div class="modal-content">

                        <div class="modal-header">
                            <h5 class="modal-title" id='edit-zone-label'>Edit zone</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        <div class="modal-body">
                            <form enctype="multipart/form-data" action='/api/edit-zone' method='POST' id="form-edit-zone-` + id + `">  
                            
                                <div class="form-group">
                                    <input type="text" class="form-control" id="zoneid" name="zoneid" readonly value="`+ zoneid + `">
                                </div>

                                <div class="form-group">
                                    <input type="text" class="form-control" id="location1" name="location1" readonly value="`+ location1 + `">
                                </div>

                                <div class="form-group">
                                    <input type="email" class="form-control" id="location2" name="location2" readonly value="`+ location2 + `">
                                </div>

                                <div class="form-group">
                                    <input type="text" class="form-control" id="location3" name="location3" readonly value="`+ location3 + `">
                                </div>

                                <div class="form-group">
                                    <input type="radio" `+ custommap + ` name="map" value="` + (() => { return (path == 'NULL' || !path) ? 'custom' : path })() + `"> Custom Map ` + (() => { return (path == 'NULL' || !path) ? '' : '(<a target="_blank" rel="noopener noreferrer" href="/images/custom-maps/' + path + '">Image</a>)' })() + ` </input> <br>
                                    <input type="radio" `+ olmap + ` name="map" value="ol"> OL Map </input>
                                </div>

                                <div class="form-group">
                                    <input id="image-file" `+ (() => { return olmap ? 'disabled' : '' })() + ` name="mapimage" type="file">
                                </div>

                                <div class="form-group form-checkboxes">
                                    `+ checkboxes + `
                                </div>

                            </form>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal"
                                aria-label="Close">Close</button>
                            <button type="submit" value="submit" form="form-edit-zone-` + id + `"
                                class="btn btn-primary">Save</button>
                        </div>

                    </div>
                </div>
            </div>
            </div>`
} // END ZONE MODAL

// Append zone list
let zonesAndUserList
let zonesRaw
let userDataBuffer
fetchAdminsPromise.then(() => {
    fetchZones().then((result) => {

        // console.log(result)

        // Get company of user when role=='admin' otherwise it will be set in fetchAdminsPromise
        if (company.length == 0) {
            company = result[0][0].company
            $(".top-container span b").html(company)
        }

        // console.log(result[0][0], result[0][0].hasOwnProperty('role'))
        let userRole = {
            superadmin: false,
            admin: false
        }

        if (result[0][0].hasOwnProperty('role')) {
            // console.log("admin")
            userRole.admin = true
        } else {
            // console.log("superadmin")
            userRole.superadmin = true
        }

        // ZONES TAB
        // ==============================

        if (userRole.superadmin) {
            zonesAndUserList = result[0]
            zonesRaw = result[1]
        } else if (userRole.admin) {
            zonesAndUserList = []
            // { alerts, battery, closedTimer, max, min, offset, opemTimer,role,sensorId,sensorName,sensorType,x,y, ...userDataBuffer } = result[0];
            zonesRaw = result[0]
        }

        // Delete all duplicated by zoneId
        zonesRaw = _.uniqBy(zonesRaw, function (e) {
            return e.zoneId;
        });

        // console.log(userRole, result)

        // console.log(result)
        // console.log(userData_raw)

        if (!zonesRaw.length) {
            // Append rows to zone-tab
            $(".zone-tab .mid-container table tbody").append(`<tr><td>No zone for this team</td><td></td><td></td></tr>`)
        }

        zonesRaw.forEach(zone => {
            // console.log(zone)

            // Generate unique Id
            let date = new Date()
            let modalId = date.getTime() + Math.floor((Math.random() * 100) + 1)

            // Append rows to zone-tab
            // console.log(zone.zoneId, zone.map)
            $(".zone-tab .mid-container table tbody").append(`<tr zoneid='` + zone.zoneId + `'>
                    <td>` + zone.location1 + ` / ` + zone.location2 + ` / ` + zone.location3 + `</td>
                    <td>` + (() => { return zone.map == 'custom' ? 'You need to set and image' : (zone.map == 'ol' ? "Standard map" : (zone.map == 'NULL' || zone.map == null ? "Set a map" : 'Custom map')) })() + `</td>
                    <td><span class='edit-zone' zoneid='` + zone.zoneId + `' modalid='` + modalId + `'><i class="fas fa-edit"></i></span></td>
                </tr>`)
            // }

            // Check zone.map
            let custommap, olmap, path
            if (zone.map == 'ol') {
                custommap = ''
                olmap = 'checked'
                path = ''
            }
            else if (zone.map == 'custom') {
                custommap = 'checked'
                olmap = ''
                path = ''
            } else if (zone.map != null) {
                custommap = 'checked'
                olmap = ''
                path = zone.map.split('/')[zone.map.split('/').length - 1]
            } else {
                custommap = ''
                olmap = ''
                path = ''
            }

            // Disable input file if custommap is unchecked initially [??? idk what is this doing]
            if (custommap == 'unchecked')
                $(".zone-modal #image-file").attr("disabled", true)

            // Append edit zone modal with unique id
            if (userRole.admin)
                $(".zone-settings .inner-settings").append(zoneModal(modalId, zone.zoneId, zone.location1, zone.location2, zone.location3, custommap, olmap, path, [[], []]))
            else if (userRole.superadmin)
                $(".zone-settings .inner-settings").append(zoneModal(modalId, zone.zoneId, zone.location1, zone.location2, zone.location3, custommap, olmap, path, result))

            // Mark user checked
            // let usersList
            // result.forEach((zone, index) => {
            //     usersList = new Set(zone.usersList.split(','));
            // })

            // console.log(usersList)

            // let labels = $(".zone-settings .inner-settings .form-checkboxes label input")
            // for (let item of labels) {
            //     let username = $(item).attr("value")
            //     if (usersList.has(username)) {
            //         $(item).attr('checked', true)
            //     }
            // }

            // Open Modal Trigger
            $(`.edit-zone[modalid='` + modalId + `']`).on('click', function () {
                $(`#edit-zone-modal-` + modalId).modal({
                    backdrop: 'static'
                });
            });

            // Save data
            $(`#edit-zone-modal-` + modalId + ` button[type='submit']`).on('click', function (e) {
                // e.preventDefault();
                // console.log("clicked!!!")
                // $.ajax({
                //     method: "POST",
                //     url: "/api/edit-zone",
                //     data: { id: zone.zoneId }
                // }).done(function (msg) {
                //     console.log("Data Saved: ", msg);
                // });
            });

        })

        // Toggle input file
        $("input[name='map']").on('change', (e) => {
            if (e.target.defaultValue == 'custom') {
                $(".zone-modal input[value='custom']").prop("checked", true)
                $(".zone-modal input[value='ol']").prop("checked", false)
                $(".zone-modal #image-file").attr("disabled", false)
            }
            else {
                $(".zone-modal input[value='custom']").prop("checked", false)
                $(".zone-modal input[value='ol']").prop("checked", true)
                $(".zone-modal #image-file").attr("disabled", true)
            }
        })

        // END ZONES TAB
        // ==============================

    }).then(() => {


        // REPORT CONTAINER
        // ==============================

        // Create Report Zone
        let date, month, maxDays
        zonesRaw.forEach((zone) => {
            // Sensor counter
            let counter = getValuesFromObject('zoneId', userData_raw).filter(zoneId => zoneId == zone.zoneId).length

            // Date
            date = new Date()
            month = monthChanger(date.getMonth()) //.slice(0,3) // display one month before current month 
            maxDays
            if (date.getMonth() == 0) {
                maxDays = 31 //if current month if 0 (January) return maxDays of december last year which is 31
            } else {
                maxDays = getDaysInMonth(date.getMonth(), date.getFullYear()) //return maxDays of last month
            }

            // Append zone
            $(".report-settings .mid-container table tbody").append(`<tr><td><div class='form-checkboxes'><label><input type="checkbox" name="zone` + zone.zoneId + `" value="` + zone.zoneId + `">` + zone.location1 + ` / ` + zone.location2 + ` / ` + zone.location3 + `</label></div></td><td>` + counter + `</td></tr>`)

        })

        // Edit button for quick report
        // $(".report-buttons .create-quick-report span").append(` on `+month.slice(0,3))

        // Quick report button
        $(".report-buttons .create-quick-report").on('click', () => {

            let listOfZones = []

            // Get checked checkboxes
            $(".report-settings .mid-container table tbody input").each((index, item) => {
                if ($(item).prop("checked")) {
                    listOfZones.push(parseInt($(item).attr('value')))
                }
            })

            if (listOfZones.length)
                getMultiReport(listOfZones)
            else
                alert("Please select a zone before creating a report")

        })

        // Normal report button
        $(".report-buttons .create-report").on('click', () => {

            let listOfZones = []

            // Get checked checkboxes
            $(".report-settings .mid-container table tbody input").each((index, item) => {
                if ($(item).prop("checked")) {
                    listOfZones.push(parseInt($(item).attr('value')))
                }
            })

            let startDate = $(".report-settings input[name='start-date']").val()
            let endDate = $(".report-settings input[name='end-date']").val()

            // console.log(startDate, endDate)

            if (listOfZones.length) {
                if (startDate && endDate) {
                    let date = [startDate, endDate]
                    getMultiReport(listOfZones, date)
                } else {
                    alert("Please select a date before creating a report")
                }
            }
            else
                alert("Please select a zone before creating a report")

        })


        // END REPORT CONTAINER
        // ==============================
    })
})







// Check inputs of form before submit
const isPassword = () => {
    let el = $("#form-create-admin input[name='password']")
    return passwordChecker(el[0].value) ? false : true
}

const isUsername = () => {
    let el = $("#form-create-admin input[name='username']")
    return el[0].value ? true : false
}

const isName = () => {
    let el = $("#form-create-admin input[name='name']")
    return el[0].value ? true : false
}

const isEmail = () => {
    let el = $("#form-create-admin input[name='email']")
    return el[0].value ? true : false
}

const isCompany = () => {
    let el = $("#form-create-admin input[name='company']")
    return el[0].value ? true : false
}

$("button[type='submit']").on('click', async (e) => {
    e.preventDefault();

    if (isPassword() && isUsername() && isName() && isEmail() && isCompany()) {

        var formData = $('#form-create-admin').serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});

        var http = new XMLHttpRequest();
        var url = '/api/create-admin';
        var params = $('#form-create-admin').serialize();
        http.open('POST', url, true);

        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.onreadystatechange = function () { //Call a function when the state changes.
            if (http.readyState == 4 && http.status == 200) {
                if (http.responseText == 'User registered!') {
                    $('.modal-footer button[value="submit"]').addClass('btn-success');
                    $('.modal-footer button[value="submit"]').html("Success")
                    setTimeout(() => {
                        location.reload();
                    }, 500)
                } else {
                    $('.modal-footer button[value="submit"]').addClass('btn-danger');
                    $('.modal-footer button[value="submit"]').html("Failed")
                }
            } else {
                console.warn(http)
            }
        }
        http.send(params);

    } else {
        if (isPassword()) $("#form-create-admin input[name='password']").removeClass("input-invalid")
        if (isUsername()) $("#form-create-admin input[name='username']").removeClass("input-invalid")
        if (isName()) $("#form-create-admin input[name='name']").removeClass("input-invalid")
        if (isEmail()) $("#form-create-admin input[name='email']").removeClass("input-invalid")
        if (isCompany()) $("#form-create-admin input[name='company']").removeClass("input-invalid")

        if (!isPassword()) $("#form-create-admin input[name='password']").addClass("input-invalid")
        if (!isUsername()) $("#form-create-admin input[name='username']").addClass("input-invalid")
        if (!isName()) $("#form-create-admin input[name='name']").addClass("input-invalid")
        if (!isEmail()) $("#form-create-admin input[name='email']").addClass("input-invalid")
        if (!isCompany()) $("#form-create-admin input[name='company']").addClass("input-invalid")
    }
})