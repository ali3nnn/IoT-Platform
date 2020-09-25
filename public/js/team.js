// Imports
import {
    timeoutAsync
} from './utils.js'

// get users from mysql
let getUsers = async () => {
    let response = await fetch("https://anysensor.dasstec.ro/api/get-users")
    console.log(response)
    return response.json()
}

// get zones assigned to each user
let getZones = async (username) => {
    let response = await fetch("https://anysensor.dasstec.ro/api/v2/sensors-access?username=" + username)
    return response.json()
}

let main = (async () => {
    return await getUsers()
    // console.log(usersTable)
})().then(async (usersJson) => {

    console.log(usersJson)
    const rows = usersJson[0].length
    var modalBtnFlag = 0
    var currentCompany = ''

    // console.log(usersJson[0])

    usersJson[0].forEach(row => {
        if (row.Username == loggedInUser) {
            currentCompany = row.company
            $(".small-box-container .company").html(currentCompany)
        }
    })

    for (var i = 0; i < rows; i++) {
        // && loggedInUser != usersJson[0][i].Username
        if (currentCompany == usersJson[0][i].company && usersJson[0][i].User_role != 'superadmin') {
            (async () => {

                $("body").append(`
                <div class="modal modal-` + usersJson[0][i].Username + `" id="edit-user-` + usersJson[0][i].Username + `" aria-labelledby="edit-user-label-` + usersJson[0][i].Username + `" aria-hidden="true" tabindex="-1" role="dialog">
                    <div class="modal-dialog fadeInModal modal-dialog-centered" role="document">
                        <div class="modal-content">
    
                            <div class="modal-header">
                                <h5 class="modal-title" id='edit-user-label-` + usersJson[0][i].Username + `'>Edit user: ` + usersJson[0][i].Username + `</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
    
                            <div class="modal-body">
                                <form action='/api/edit-user' method='GET' id="form-edit-user-` + usersJson[0][i].Username + `">

                                    <div class="form-group hidden">
                                        <input type="text" class="form-control" name="id" value="` + usersJson[0][i].Id + `">
                                    </div>
    
                                    <div class="form-group">
                                        <input type="text" class="form-control" id="name" name="name" value="` + usersJson[0][i].Name + `">
                                    </div>
    
                                    <div class="form-group">
                                        <input type="text" class="form-control" id="username" name="username" value="` + usersJson[0][i].Username + `">
                                    </div>
    
                                    <div class="form-group">
                                        <input type="email" class="form-control" id="email" name="email" value="` + usersJson[0][i].Email + `">
                                    </div>
    
                                    <div class="form-group">
                                        <input type="text" class="form-control" id="password" name="password" placeholder='Type a new password or leave it as it is'>
                                    </div>
    
                                    <div class="form-group">
    
                                        <label>Zones</label>
                                    
                                        <div class="form-zones-container">
                                              
                                        </div>         
    
                                    </div>
                                </form>
                            </div>
    
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-toggle="modal" data-target=".modal-` + usersJson[0][i].Username + `">Close</button>
                                <button type="submit" value="Submit" form="form-edit-user-` + usersJson[0][i].Username + `" class="btn btn-primary">Save Changes</button>
                            </div>
    
                        </div>
                    </div>
                </div>
                `)

                // set current user first in list
                if (usersJson[0][i].Username == loggedInUser) {
                    $(".team-container tbody").prepend(`
                    <tr class='current-user'>
                        <td class="user-col">` +
                        usersJson[0][i].Name + `<br>` +
                        usersJson[0][i].Username + `<br>` +
                        usersJson[0][i].Email + `<br>` +
                        `</td>
                        <td class="zones-col zones-` + usersJson[0][i].Username + `">
                            <a href="#" class='spinner ` + usersJson[0][i].Username + `-zone-spinner'>
                                <span>Loading...</span>
                            </a>
                        </td>
                        <td class="actions-col">
                            <button disabled type="button" class="btn btn-outline-primary edit-user-` + usersJson[0][i].Username + `">
                                <i class="fal fa-edit"></i>
                                <span>Edit User</span>
                            </button>
                            <button disabled type="button" class="btn btn-danger remove-user">
                                <i class="fal fa-user-minus"></i>
                                <span>Remove User</span>
                            </button>
                        </td>
                    </tr>
                `)
                } else {
                    $(".team-container tbody").append(`
                        <tr>
                            <td class="user-col">` +
                        usersJson[0][i].Name + `<br>` +
                        usersJson[0][i].Username + `<br>` +
                        usersJson[0][i].Email + `<br>` +
                        `</td>
                            <td class="zones-col zones-` + usersJson[0][i].Username + `">
                                <a href="#" class='spinner ` + usersJson[0][i].Username + `-zone-spinner'>
                                    <span>Loading...</span>
                                </a>
                            </td>
                            <td class="actions-col">
                                <button type="button" class="btn btn-outline-primary edit-user-` + usersJson[0][i].Username + `">
                                    <i class="fal fa-edit"></i>
                                    <span>Edit User</span>
                                </button>
                                <button type="button" class="btn btn-danger remove-user">
                                    <i class="fal fa-user-minus"></i>
                                    <span>Remove User</span>
                                </button>
                            </td>
                        </tr>
                    `)
                }

                return await getZones(usersJson[0][i].Username)
                // return zonesTable

            })().then(zonesTable => {

                var currentUserZones = []

                zonesTable.data.forEach(element => {

                    // console.log(element)
                    currentUserZones.push(element.zone)

                    // append zones to modal
                    if (element.query == loggedInUser && element.zone != undefined) {
                        $(".modal form .form-zones-container").append(`
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="` + element.zone + `" id="` + element.zone + `" name="zones">
                                <label class="form-check-label" for="` + element.zone + `">
                                    ` + element.zone + `
                                    <span></span>
                                </label>
                            </div>
                        `)
                    }

                    turnOnClick(element.query)

                    $(".team-container ." + element.query + "-zone-spinner").remove()

                    if (element.error)
                        $(".team-container .zones-" + element.query).append(`<span class="no-zone">` + element.error + `</span>`)
                    else {
                        $(".team-container .zones-" + element.query).append(`<span class="zone" belongsTo="` + element.belongsTo + `">` + element.zone + `</span>`)
                    }

                    // console.log($(".modal-"+element.query+" .form-zones-container input[id='"+element.zone+"']"))
                    // $("input[id='"+element.zone+"']").addClass("test")
                    // $("input[id='"+element.zone+"']").prop( "checked", true );

                })

                // check zones in modal
                // zonesTable.data.forEach(element => {
                //     if(currentUserZones.includes(element.zone) && element.zone != undefined) {
                //         // console.log($(".modal-"+element.query+" .form-zones-container input[id='"+element.zone+"']"), currentUserZones, element.zone)
                //         console.log($(".modal-"+element.query+" .form-zones-container input[id='"+element.zone+"']"))
                //         $(".modal-"+element.query+" .form-zones-container input[id='"+element.zone+"']").prop( "checked", true );
                //     }
                //         // $(".modal-"+element.query+" .form-zones-container .form-check-input[id='"+element.zone+"']").attr("checked")
                // })



            }).then(() => {

            })
        }

    }



}).then(() => {

    timeoutAsync(1000, function () {
        // console.log($(".team-container tr .zones-col .zone").length)
        for (var i = 0; i < $(".team-container tr .zones-col").length; i++) {
            for (var j = 0; j < $(".team-container tr .zones-col")[i].children.length; j++) {
                var username = $(".team-container tr .zones-col")[i].className.split(" ")[1].split('zones-')[1]
                var zone = $(".team-container tr .zones-col")[i].children[j].innerHTML
                if (zone != 'No zone assigned')
                    $(`.modal-` + username + ` input[id="` + zone + `"]`).prop("checked", true);
                else
                    $(`.modal-` + username + ` input[id="` + zone + `"]`).prop("checked", false);
            }
        }
    })
})



function turnOnClick(user) {

    $(`.edit-user-` + user + ``).click(function () {
        $(`#edit-user-` + user + ``).modal({
            backdrop: 'static'
        });
    });


    // callback when modal shows
    // $('.modal-' + user + '').on('shown.bs.modal', function (e) {
    //     console.log("shown")

    //     // $(".main-overlay").addClass("force-show-overlay")
    //     // $('#main').addClass("blur4")
    //     // $('#mySidenav').addClass("blur4")
    // })

    // // callback when modal hides
    // $('.modal-' + user + '').on('hide.bs.modal', function (e) {
    //     console.log("hide")
    //     // $(".main-overlay").removeClass("force-show-overlay")
    //     // $('#main').removeClass("blur4")
    //     // $('#mySidenav').removeClass("blur4")
    // })

}