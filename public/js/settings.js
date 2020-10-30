// Imports
import {
    timeoutAsync,
    passwordChecker,
    passwordCheckerPromise,
    allTrue,
    getDistinctValuesFromObject,
    generateUniqueId
} from './utils.js'

// $(function () {
// document ready
// });

// Fetch
let fetchAdmins = async () => {
    let response = fetch('/api/get-team')
    return (await response).json()
}

let fetchZones = async () => {
    let response = fetch('/api/get-zones')
    return (await response).json()
}


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
fetchAdmins().then(listOfAdmins => {
    listOfUsers = listOfAdmins
    listOfAdmins.forEach(admin => {
        // console.log(admin)

        // Add company in form
        if (!company) {
            company = admin.company
            $("#form-create-admin input[name='company']").attr("value", company) // Append company name in form
            $(".top-container span b").html(company) // Append company name in title
        }

        $(".admin-list table tbody").append(`<tr username='` + admin.username + `'>
                                                <td>` + admin.name + `</td>
                                                <td>` + admin.username + `</td>
                                                <td>` + admin.email + `</td>
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
})

// END ADMIN TAB
// ==============================


// ZONES TAB
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
        return '<label><input type="checkbox" ' + checked + ' name="'+name+'" value="' + username + '">' + username + '</label>'
    }

    // Init checkboxes
    let checkboxes_checked = ``
    let checkboxes_unchecked = ``
    let checkboxes = ``

    // Duplicate checker
    let usersUnchecked = []
    let usersChecked = []
    let userBuffer = []

    // Build Checkboxes w/ username
    listOfZoneAccess.forEach(zone => {

        // se parcurge fiecare zona

        // if (zone.zoneId == zoneid) { // se verifica daca zona iterata este egala cu zona din modal, daca da
        //     // se preia usernamul zonei si se face append in checkboxes_checked, daca nu s-a facut deja
        //     if (usersUnchecked.indexOf(zone.username) == -1 && usersChecked.indexOf(zone.username) == -1) {
        //         usersChecked.push(zone.username)
        //         checkboxes_checked += checkboxesTemplate(zone.username, 'checked')
        //     }
        // } else { // se verifica daca zona iterata este egala cu zona din modal, daca nu
        //     // se preaia usernameul zonei si se face append in checkboxes_unchecked daca nu s-a facut deja
        if (userBuffer.indexOf(zone.username) == -1) {
            userBuffer.push(zone.username)
            let idsForUser = getZones(zone.username, listOfZoneAccess)
            if (idsForUser.indexOf(zoneid) !== -1) {
                checkboxes += checkboxesTemplate('username'+userBuffer.indexOf(zone.username),zone.username, 'checked')
            } else {
                checkboxes += checkboxesTemplate('username'+userBuffer.indexOf(zone.username),zone.username, '')
            }
        }
        // }

        // console.log(zoneid, usersChecked, usersUnchecked)

    })

    // let checkboxes = checkboxes_checked + checkboxes_unchecked

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
                                    <input type="radio" `+ custommap + ` name="map" value="custom"> Custom Map ` + (() => { return path ? '(<a target="_blank" rel="noopener noreferrer" href="/images/custom-maps/' + path + '">Image</a>)' : '' })() + ` </input> <br>
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
}

// console.log(userData_raw)

// Append zone list
fetchZones().then((result) => {
    // console.log(result)

    // Append modal for zone access
    // $(".zone-tab").append(zoneAccessModal())

    // Trigger modal zone access
    // $(function () {
    // $(`.edit-zone-access`).on('click', function () {
    //     $(`#edit-zoneAccess-modal`).modal({
    //         backdrop: 'static'
    //     });
    // });
    // });

    let bufferAppendedZones = []

    console.log(result)

    result.forEach(zone => {
        // Generate unique Id
        let date = new Date()
        let modalId = date.getTime() + Math.floor((Math.random() * 100) + 1)

        // Prevet double insert of zones
        let aux_checker = JSON.stringify(bufferAppendedZones);
        let aux_item = JSON.stringify([zone.location3, zone.location2, zone.location1]);
        let hasBeenAppended = aux_checker.indexOf(aux_item)

        if (hasBeenAppended == -1) {
            bufferAppendedZones.push([zone.location3, zone.location2, zone.location1])

            // Append rows to zone-tab
            $(".zone-tab .mid-container table tbody").append(`<tr zoneid='` + zone.zoneId + `'>
                    <td>` + zone.location1 + ` / ` + zone.location2 + ` / ` + zone.location3 + `</td>
                    <td>` + (() => { return zone.map == 'custom' ? 'You need to set and image' : (zone.map == 'ol' ? "Standard map" : (zone.map == 'NULL' ? "Set a map" : 'Custom map')) })() + `</td>
                    <td><span class='edit-zone' zoneid='` + zone.zoneId + `' modalid='` + modalId + `'><i class="fas fa-edit"></i></span></td>
                </tr>`)

        }
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
        } else if (zone.map) {
            custommap = 'checked'
            olmap = ''
            path = zone.map.split('/')[zone.map.split('/').length - 1]
        } else {
            custommap = ''
            olmap = ''
            path = ''
        }

        // Disable input file if custommap is unchecked initially
        if (custommap == 'unchecked')
            $(".zone-modal #image-file").attr("disabled", true)

        // Append edit zone modal with unique id
        $(".zone-settings .inner-settings").append(zoneModal(modalId, zone.zoneId, zone.location1, zone.location2, zone.location3, custommap, olmap, path, result))

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

})
    .then(() => {
        timeoutAsync(1000, function () {

            // console.log($(".team-container tr .zones-col .zone").length)
            // for (var i = 0; i < $(".team-container tr .zones-col").length; i++) {
            //     for (var j = 0; j < $(".team-container tr .zones-col")[i].children.length; j++) {
            //         var username = $(".team-container tr .zones-col")[i].className.split(" ")[1].split('zones-')[1]
            //         var zone = $(".team-container tr .zones-col")[i].children[j].innerHTML
            //         if (zone != 'No zone assigned')
            //             $(`.modal-` + username + ` input[id="` + zone + `"]`).prop("checked", true);
            //         else
            //             $(`.modal-` + username + ` input[id="` + zone + `"]`).prop("checked", false);
            //     }
            // }    

            let counterZoneModal = $(".zone-modal").length

            $(".zone-modal").each((index, element) => {
                // let e = $(this)
                // console.log( $(element.className).attr() )
            })

        })

    })

// END ZONES TAB
// ==============================

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