// Imports
import {
    timeoutAsync,
    passwordChecker
} from './utils.js'
const bcrypt = require('bcryptjs');
// End Imports

// Config BcryptJS
const saltRounds = 1;
const salt = bcrypt.genSaltSync(saltRounds);
// End config

// get users from mysql
let getUsers = async () => {
    let response = await fetch("/api/get-users")
    // console.log(response)
    return response.json()
}

// get zones assigned to each user
let getZones = async (username) => {
    let response = await fetch("/api/v2/sensors-access?username=" + username)
    return response.json()
}

let main = (async () => {
    return await getUsers()
    // console.log(usersTable)
})().then(async (usersJson) => {

    // console.log("usersJson", usersJson)

    const rows = usersJson[0].length
    var modalBtnFlag = 0
    var currentCompany = ''

    // console.log(usersJson[0])

    // Small box info
    usersJson[0].forEach(row => {
        if (row.Username == loggedInUser) {
            currentCompany = row.company
            $(".small-box-container .company").html(currentCompany) // add company to smallbox info
            $("#form-add-user input[name='company']").val(currentCompany) // add company to add-user form
        }
    })

    // Append the users
    for (var i = 0; i < rows; i++) {
        // && loggedInUser != usersJson[0][i].Username
        if (currentCompany == usersJson[0][i].company && usersJson[0][i].User_role != 'superadmin') {
            (async () => {

                var usernameConverted = "user" + usersJson[0][i].Username.replace(".", "_")
                // console.log("usernameConverted", usernameConverted)

                $("body").append(`
                <div class="modal modal-` + usernameConverted + `" id="edit-user-` + usernameConverted + `" aria-labelledby="edit-user-label-` + usernameConverted + `" aria-hidden="true" tabindex="-1" role="dialog">
                    <div class="modal-dialog fadeInModal modal-dialog-centered" role="document">
                        <div class="modal-content">
    
                            <div class="modal-header">
                                <h5 class="modal-title" id='edit-user-label-` + usernameConverted + `'>Edit user: ` + usersJson[0][i].Username + `</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
    
                            <div class="modal-body">
                                <form action='/api/edit-user' method='GET' id="form-edit-user-` + usernameConverted + `">
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
                                <button type="button" class="btn btn-secondary" data-toggle="modal" data-target=".modal-` + usernameConverted + `">Close</button>
                                <button type="submit" value="Submit" form="form-edit-user-` + usernameConverted + `" class="btn btn-primary">Save Changes</button>
                            </div>
    
                        </div>
                    </div>
                </div>
                `)

                // set current user first in list
                if (usersJson[0][i].Username == loggedInUser) {
                    $(".team-container tbody").prepend(`
                    <tr class='current-user' username="` + usersJson[0][i].Username + `">
                        <td class="user-col">` +
                        usersJson[0][i].Name + `<br>` +
                        usersJson[0][i].Username + `<br>` +
                        usersJson[0][i].Email + `<br>` +
                        `</td>
                        <td class="zones-col zones-` + usernameConverted + `">
                            <a href="#" class='spinner ` + usernameConverted + `-zone-spinner'>
                                <span>Loading...</span>
                            </a>
                        </td>
                        <td class="actions-col">
                            <button type="button" class="btn btn-outline-primary edit-user-` + usernameConverted + `">
                                <i class="fal fa-edit"></i>
                                <span>Edit User</span>
                            </button>
                            <button type="button" class="btn btn-danger remove-user-` + usernameConverted + `">
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
                            <td class="zones-col zones-` + usernameConverted + `">
                                <a href="#" class='spinner ` + usernameConverted + `-zone-spinner'>
                                    <span>Loading...</span>
                                </a>
                            </td>
                            <td class="actions-col">
                                <button type="button" class="btn btn-outline-primary edit-user-` + usernameConverted + `">
                                    <i class="fal fa-edit"></i>
                                    <span>Edit User</span>
                                </button>
                                <button type="button" class="btn btn-danger remove-user-` + usernameConverted + `">
                                    <i class="fal fa-user-minus"></i>
                                    <span>Remove User</span>
                                </button>
                            </td>
                        </tr>
                    `)
                }

                turnOnClick(usernameConverted)

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

                    var usernameConverted = "user" + element.query.replace(".", "_")

                    // turnOnClick(usernameConverted)

                    $(".team-container ." + usernameConverted + "-zone-spinner").remove()

                    if (element.error)
                        $(".team-container .zones-" + usernameConverted).append(`<span class="no-zone">` + element.error + `</span>`)
                    else {
                        $(".team-container .zones-" + usernameConverted).append(`<span class="zone" belongsTo="` + element.belongsTo + `">` + element.zone + `</span>`)
                    }

                })

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

    $(`.add-user`).click(function () {
        $(`#add-user`).modal({
            backdrop: 'static'
        });
    });

    console.log("turnOnClick("+user+")")
    $(`.remove-user-` + user + ``).on('click', function (e) {
        e.preventDefault();
        var thisEl = $(this)
        var ask = confirm("Do you want to REMOVE the user ?")
        if (ask) {
            var userReconverted = user.replace("_", ".").split('user')[1]
            fetch('/api/remove-user?username=' + userReconverted).then(() => {
                thisEl.parent().parent().remove()
            })
        } else {
            // if user clicks cancel
            console.log("canceled")
        }

    })

}



// Check password in modal-add-user
if ($(".modal-add-user input[name='password']").length) {
    $(".modal-add-user button[type='submit']").attr('disabled', true)
    document.querySelector('.modal-add-user input#password').addEventListener('input', function (e) {
        e.preventDefault();
        if (passwordChecker(this.value)) {
            $('.modal-add-user input#password').addClass("wrong-password")
            $('.modal-add-user input#password').removeClass("correct-password")
            $(".modal-add-user button[type='submit']").attr('disabled', true)
            // $(".password-message").remove()
            // $(".modal-add-user button[type='submit']").insertAfter(`<p class="password-message">`+passwordChecker(this.value)+`</p>`)
        } else {
            $('.modal-add-user input#password').addClass("correct-password")
            $('.modal-add-user input#password').removeClass("wrong-password")
            $(".modal-add-user button[type='submit']").attr('disabled', false)
            // $(".modal-add-user button[type='submit']").html("Add new user")
        }
    })
}