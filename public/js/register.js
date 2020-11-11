var Checker = require('password-checker');
var checker = new Checker();

// Start imports
import {
    allTrue
} from './utils.js'

// Password Checker Config
checker.min_length = 6;
checker.max_length = 20;
checker.requireLetters(true);
checker.requireNumbers(true);
checker.requireSymbols(false);
checker.checkLetters(true);
checker.checkNumbers(true);
checker.checkSymbols(true);
// Change the letters that are allowed
// checker.allowed_letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz'; // Default is: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
// checker.allowed_numbers = '1234567890'; // Default is: 0123456789
checker.allowed_symbols = '-.'; // Default is: _- !\"?$%^&*()+={}[]:;@'~#|<>,.?\\/
// End Password Checker Config

// var passwordField = document.querySelector('.login-container .charInput:nth-child(4)');
// var otherPasswordFields = document.querySelectorAll('.login-container .charInput:not(:nth-child(4))');
// var registerButton = document.querySelector('.login-container input:last-child');

// var passwordRules = document.querySelector('.login-container .passwordRules');

// var passwordUpperCase = document.querySelector('.login-container .passwordRules li:first-child');
// var passwordLowerCase = document.querySelector('.login-container .passwordRules li:nth-child(2)');
// var passwordDigit = document.querySelector('.login-container .passwordRules li:nth-child(3)');
// var password8Char = document.querySelector('.login-container .passwordRules li:nth-child(4)');

var passwordField = document.querySelector('.login-container input[name="password"]');
var passwordConfirm = document.querySelector('.login-container input[name="passwordConfirm"]');
var registerButton = document.querySelector('.login-container input[name="register"]');

// Input Values
let allInputs = () => {

    let formName = $('.login-container input[name="name"]').val()
    let formCompany = $('.login-container input[name="company"]').val()
    let formUsername = $('.login-container input[name="username"]').val()
    let formEmail = $('.login-container input[name="email"]').val()
    let formPassword = $('.login-container input[name="password"]').val()
    let formConfirm = $('.login-container input[name="passwordConfirm"]').val()

    // console.log(formName)

    let obj = {
        formName,
        formCompany,
        formUsername,
        formEmail,
        formPassword,
        formConfirm
    }

    return [obj, allTrue(obj)]
}


// Time Helper Debug
function timeDebug(str) {
    let date = new Date()
    date = date.getMilliseconds()
    console.log(str, date)
}

//hide the rules
if (registerButton) {
    registerButton.value = "Fill the inputs"
    registerButton.disabled = true
}

var initialPassword = ''

$('.login-container input').on('keyup',function (elem) {

    let attrName = $(this)[0].name
    // console.log(attrName, allInputs()[1])

    if (attrName != 'password' && attrName != 'passwordConfirm') {
        if (allInputs()[1]) {
            registerButton.value = "Register"
            registerButton.disabled = false
        } else {
            registerButton.value = "Fill the inputs"
            registerButton.disabled = true
        }
    } else if (attrName == 'password') {
        var passwordMessage = ''
        if (!checker.check(this.value)) {
            passwordMessage = checker.errors[0].message
            registerButton.value = passwordMessage
            registerButton.disabled = true
            registerButton.disabled__custom = false
        } else {
            registerButton.value = "Confirm the password"
            registerButton.disabled = true
            initialPassword = this.value
        }
    } else if (attrName == 'passwordConfirm') {
        if (initialPassword == this.value) {
            // console.log(initialPassword, this.value)

            if (allInputs()[1]) {
                registerButton.value = "Register"
                registerButton.disabled = false
            } else {
                registerButton.value = "Fill the inputs"
                registerButton.disabled = true
            }

        } else {
            registerButton.value = "Confirm the password"
            registerButton.disabled = true
        }
    }

})

if (passwordField) {

    //show the rules when typing and check strongness
    passwordField.addEventListener('input', function (e) {
        e.preventDefault();

        // var passwordMessage = ''
        // if (!checker.check(this.value)) {
        //     passwordMessage = checker.errors[0].message
        //     registerButton.value = passwordMessage
        //     registerButton.disabled = true
        //     registerButton.disabled__custom = false
        // } else {
        //     registerButton.value = "Confirm the password"
        //     registerButton.disabled = true
        //     initialPassword = this.value
        // }

    });

    //show the rules when typing and check strongness
    passwordConfirm.addEventListener('input', function (e) {
        e.preventDefault();
        // if (initialPassword == this.value) {
        //     // console.log(initialPassword, this.value)

        //     if (allInputs()[1]) {
        //         registerButton.value = "Register"
        //         registerButton.disabled = false
        //     } else {
        //         registerButton.value = "Fill the inputs"
        //         registerButton.disabled = true
        //     }

        // } else {
        //     registerButton.value = "Confirm the password"
        //     registerButton.disabled = true
        // }
    });
}

var editButton = document.querySelectorAll('.users-table tbody > tr .edit-btn');
var editUserBox = document.querySelector('.edit-user');