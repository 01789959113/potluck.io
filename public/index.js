// console.log('this is ')
// console.log($);

let navbar = document.getElementById('navbar')

window.onscroll = function () { myFunction() }

function myFunction() {
    if (window.scrollY > 0) {
        navbar.classList.add('sticky')
    } else {
        navbar.classList.remove('sticky')
    }
}

// image gallery using jQuery
$(document).ready(function () {
    
    // image popup
    $('.images').magnificPopup({
        delegate: 'a',
        type: 'image',
        gallery: { enabled: true }
    });

    // count in about 
    $('.count').counterUp({
        delay: 10,
        time: 1500
    });

})


// secleting menu of home page
let thai_cuisine = document.getElementById("thai_cuisine");
let indian_cuisine = document.getElementById("indian_cuisine");
let continental_cuisine = document.getElementById("continental_cuisine");
let desert_drinks = document.getElementById("desert_drinks");

if (thai_cuisine) {
    thai_cuisine.addEventListener('click', () => {
        location.href = "/thai"
    })
}

if (indian_cuisine) {
    indian_cuisine.addEventListener('click', () => {
        location.href = "/indian"
    })
}

if (continental_cuisine) {
    continental_cuisine.addEventListener('click', () => {
        location.href = "/continental"
    })
}

if (desert_drinks) {
    desert_drinks.addEventListener('click', () => {
        location.href = "/desert"
    })
}
