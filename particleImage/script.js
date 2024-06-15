const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
    // alpha: false,
})
canvas.width = 512 * 4
canvas.height = 512 * 4


//  Navbar Menu Toggle 
const menu = document.getElementById('menu')
const hamburger = document.getElementById('hamburger')
const cross = document.getElementById('cross')
hamburger.addEventListener('click', () => {
    menu.classList.toggle('open')
    hamburger.style.display = 'none'
    cross.style.display = 'block'
})
cross.addEventListener('click', () => {
    menu.classList.toggle('open')
    hamburger.style.display = 'block'
    cross.style.display = 'none'
})

const loader = document.querySelector('.loader')


// Night Mode Toggle
const body = document.querySelector('body'),
    modeSwitch = body.querySelector('.night-mode-switch'),
    modeIcon = body.querySelector('.night-mode-icon');

modeSwitch.addEventListener('click', () => {
    if (body.classList == 'theme-dark') {
        body.classList.remove('theme-dark')
        body.classList.add('theme-light')
        body.style.backgroundColor = '#eeeeeece'
        modeIcon.classList.toggle('bi-sun')
        localStorage.setItem('mode', 'theme-light')

    } else {
        body.classList.remove('theme-light')
        body.classList.add('theme-dark')
        body.style.backgroundColor = '#111111ee'
        modeIcon.classList.toggle('bi-sun')
        localStorage.setItem('mode', 'theme-dark')

    }
    localStorage.setItem('mode', body.classList[0])

})

window.addEventListener('load', setMode)


const sliderLabel = document.getElementById('label')
const sliderInput = document.getElementById('slider-value')

const slider = document.getElementById('slider')
slider.addEventListener('change', handleSlider)

const imageFile = document.getElementById('upload')
imageFile.addEventListener('change', convert2Base64)

const download = document.getElementById('download')
download.addEventListener('click', downloadCanvasArt)

const showEle = document.getElementsByClassName('dropped')
const hideEle = document.getElementsByClassName('dragged')


//  Drag & Drop functionality
const dropRegion = document.getElementById("drag-drop"); // where images are previewed

dropRegion.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRegion.style.opacity = '1';
    dropRegion.classList.add('drop-start')
}, false);

dropRegion.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRegion.classList.remove('drop-start')
}, false);

dropRegion.addEventListener('dragover', preventDefault, false);
dropRegion.addEventListener('drop', handleDrop, false);

// User Adjustable settings
const background = document.getElementById('background')
background.addEventListener('change', handleAttribute)

const symbolShadow = document.getElementById('symbol-shadow')
symbolShadow.addEventListener('change', handleAttribute)

const symbolColor = document.getElementById('symbol-color')
symbolColor.addEventListener('change', handleAttribute)

const fontStyle = document.getElementById('font-style')
fontStyle.addEventListener('change', handleAttribute)


//Create Image for canvas
const canvasImage = new Image();
// canvasImage.src = 'edited.png'
// canvasImage.width = canvas.width
// canvasImage.height = canvas.height



class Cell {
    constructor(x, y, symbol, color) {
        this.x = x
        this.y = y
        this.symbol = symbol
        this.color = color

    }

    draw(ctx, color = 'default', shadow = 'None') {

        //Change symbol fontstyle
        ctx.font = parseInt(slider.value) * 1 + 'px ' + fontStyle.value


        //Change symbol shadow
        if (shadow !== 'default') {
            ctx.fillStyle = shadow
            ctx.fillText(this.symbol, this.x + 1, this.y + 1)
        }

        //Change symbol Color
        if (color !== 'default') {
            ctx.fillStyle = color
            ctx.fillText(this.symbol, this.x, this.y)
        } else {
            ctx.fillStyle = this.color
            ctx.fillText(this.symbol, this.x, this.y)
        }
    }

}

class AsciiEffect {
    #imageCellArray = []
    #pixels = []
    #ctx;
    #width;
    #height;
    constructor(ctx, width, height) {
        this.#ctx = ctx
        this.#width = width
        this.#height = height
        this.#ctx.drawImage(canvasImage, 0, 0, this.#width, this.#height)
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height)

    }

    #convertToSymbol(color) {
        if (color > 240) return '@';
        else if (color > 220) return '#'
        else if (color > 200) return '$'
        else if (color > 180) return '%'
        else if (color > 160) return '&'
        else if (color > 140) return '*'
        else if (color > 120) return '+'
        else if (color > 100) return '='
        else if (color > 80) return '^'
        else if (color > 60) return 'q'
        else if (color > 40) return ':'
        else if (color > 20) return '!'
        else if (color < 20) return '.'
        else return '';
    }

    #scanImage(cellSize) {
        this.#imageCellArray = []
        for (let y = 0; y < this.#pixels.height; y += cellSize) {
            for (let x = 0; x < this.#pixels.width; x += cellSize) {
                const posX = x * 4
                const posY = y * 4
                const pos = (posY * this.#pixels.width) + posX;

                if (this.#pixels.data[pos + 3] > 128) {
                    const red = this.#pixels.data[pos]
                    const green = this.#pixels.data[pos + 1]
                    const blue = this.#pixels.data[pos + 2]

                    const averageColorValue = (red + green + blue) / 3
                    const color = "rgb(" + red + ',' + green + ',' + blue + ')'
                    const symbol = this.#convertToSymbol(averageColorValue)
                    if (averageColorValue > 100) this.#imageCellArray.push(new Cell(x, y, symbol, color))

                }
            }
        }
    }

    #drawAscii() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height)
        effect.changeBackground()
        for (let i = 0; i < this.#imageCellArray.length; i++) {
            this.#imageCellArray[i].draw(this.#ctx, symbolColor.value, symbolShadow.value)
        }

    }

    draw(cellSize) {
        this.#scanImage(cellSize)
        this.#drawAscii()

    }

    // Change canvas Background Color
    changeBackground() {
        if (background.value === 'whiste') {
            canvas.classList.add('white')
            ctx.fillStyle = background.value
            ctx.fillRect(0, 0, canvas.width, canvas.height)

        } else if (background.value !== 'default') {
            canvas.style.backgroundColor = background.value
            ctx.fillStyle = background.value
            ctx.fillRect(0, 0, canvas.width, canvas.height)

        } else {
            canvas.classList.remove('white')
            canvas.style.backgroundColor = '#00000093'
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }
}



let effect;
canvasImage.onload = function initialize() {
    canvas.width = canvasImage.width
    canvas.height = canvasImage.height
    // canvas.backgroundColor = 'white'
    effect = new AsciiEffect(ctx, canvasImage.width, canvasImage.height)
    hideDragAndDropMenu()
    handleSlider()

}


function handleSlider() {
    showLoader(true)
    if (slider.value == 1) {
        sliderLabel.innerHTML = 'Original Image'
        sliderInput.value = slider.value
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height)
    } else {
        sliderLabel.innerHTML = 'resolution'
        sliderInput.value = parseInt(slider.value)
        if (imageFile.files.length) { effect.draw(slider.value * 1) }
        showLoader(false)
    }
    if (imageFile.files.length > 0) hideDragAndDropMenu(true)

}

function convert2Base64() {
    hideDragAndDropMenu()
    showLoader(true)
    if (imageFile.files.length > 0) {
        var file = imageFile.files[0];
        var reader = new FileReader();
        reader.onloadend = () => { canvasImage.src = reader.result }
        reader.readAsDataURL(file);
    }
}

function hideDragAndDropMenu(showOptions = false) {
    if (!showOptions) {
        for (let x = 0; x < showEle.length; x++) {
            if (showEle[x].id === 'drag-drop') {
                showEle[x].style.opacity = '0'
            } else {
                showEle[x].style.display = 'none';
            }
        }
    }
    if (showOptions) {
        for (let x = 0; x < hideEle.length; x++) {
            hideEle[x].style.display = 'flex';
        }
    }
}

function downloadCanvasArt() {
    // e.preventDefault()
    download.download = 'ascii-Art.png'
    download.href = canvas.toDataURL("image/png")

}

function handleAttribute() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (imageFile.files.length && effect) { effect.draw(slider.value * 1) }
}


/**  Drag & Drop functionality  **/

function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();

}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    var dt = e.dataTransfer;
    imageFile.files = dt.files;
    hideDragAndDropMenu()
    showLoader(true)
    if (imageFile.files.length) {
        handleFiles(imageFile.files);
    } else {
        var html = dt.getData('text/html'), match = html &&
            /\bsrc="?([^"\s]+)"?\s*/.exec(html), url = match && match[1];

        if (url) { uploadImageFromURL(url); return; }
    }

    function uploadImageFromURL(url) {
        var img = new Image;
        var c = document.createElement("canvas");
        var ctx = c.getContext("2d");

        img.onload = function () {
            c.width = this.naturalWidth;     // update canvas size to match image
            c.height = this.naturalHeight;
            ctx.drawImage(this, 0, 0);       // draw in image
            c.toBlob(function (blob) {        // get content as PNG blob

                // call our main function
                handleFiles([blob]);

            }, "image/png");
        };
        img.onerror = function () {
            alert("Error in uploading");
        }
        img.crossOrigin = "";              // if from different origin
        img.src = url;
    }

}

function validateImage(image) {
    // check the type
    var validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/avif', 'image/heic'];
    if (validTypes.indexOf(image.type) === -1) {
        alert("Invalid File Type « only png, jpg, svg, gif supported », Try Again!");
        return false;
    }
    var maxSizeInBytes = 10e6; // check the size <= 10MB
    if (image.size > maxSizeInBytes) {
        alert("File too large, only upload image less than 10 MB!");
        return false;
    }
    return true;
}

function previewAnduploadImage(image) {
    var reader = new FileReader();
    reader.onloadend = () => { canvasImage.src = reader.result }
    reader.readAsDataURL(image);
    // hideDragAndDropMenu()

}

function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        if (validateImage(files[i]))
            previewAnduploadImage(files[i]);
    }
}


function loadFont() {
    let name, src;

    for (let font = 0; font < customFonts.length; font++) {
        name = customFonts[font][0]
        src = customFonts[font][1]
        // loadFont(name, url)

        const fontAlreadyLoaded = document.fonts.check(`10px ${name}`);

        if (fontAlreadyLoaded) {
            const fontFace = new FontFace(name, `url(${src})`);

            try {
                fontFace.load();
                document.fonts.add(fontFace);
                settingsMap[3]['propertyValue'].push(name)
                // console.log('font loaded!')
            } catch (e) {
                console.error(`Font ${name} failed to load`);
            }
        }
    }
}

function setMode() {
    let savedMode = localStorage.getItem('mode')

    if (savedMode !== null && body.classList[0] !== savedMode) {
        body.classList.add(savedMode)
        body.style.backgroundColor = '#eeeeeece'
    } else {
        localStorage.setItem('mode', 'theme-dark')
    }


    // window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
    //     const theme = matches ? 'dark' : 'light';
    //     console.log(`Change to ${theme} mode!`);
    // });

}

function showLoader(status) {
    if (status) {
        loader.style.display = 'block';
        loader.style.opacity = '1';
    } else {
        loader.style.display = 'none';
    }
}


const settingsMap = [
    { 'propertyName': symbolColor, 'propertyValue': ['default', 'white', 'black', 'red', 'yellow', 'green', 'cyan', 'purple', 'pink', 'orange',] },
    { 'propertyName': symbolShadow, 'propertyValue': ['default', 'white', 'red', 'black', 'yellow', 'gold'] },
    { 'propertyName': background, 'propertyValue': ['default', 'white', 'black', 'ghostwhite', 'aliceblue', 'lavender', 'DarkCyan', ] },
    { 'propertyName': fontStyle, 'propertyValue': ['monospace', 'Helvetica', 'veranda', 'cursive'] },
]

// const gradients = [
//     {
//         "name": "Omolon",
//         "colors": ["#091E3A", "#2F80ED", "#2D9EE0"]
//     },
//     {
//         "name": "Farhan",
//         "colors": ["#9400D3", "#4B0082"]
//     },
//     {
//         "name": "Purple",
//         "colors": ["#c84e89", "#F15F79"]
//     },
//     {
//         "name": "Ibtesam",
//         "colors": ["#00F5A0", "#00D9F5"]
//     },
//     {
//         "name": "Radioactive Heat",
//         "colors": ["#F7941E", "#72C6EF", "#00A651"]
//     },
//     {
//         "name": "The Sky And The Sea",
//         "colors": ["#F7941E", "#004E8F"]
//     },
//     {
//         "name": "From Ice To Fire",
//         "colors": ["#72C6EF", "#004E8F"]
//     },
//     {
//         "name": "Blue & Orange",
//         "colors": ["#FD8112", "#0085CA"]
//     },
//     {
//         "name": "Purple Dream",
//         "colors": ["#bf5ae0", "#a811da"]
//     },
//     {
//         "name": "Blu",
//         "colors": ["#00416A", "#E4E5E6"]
//     },
//     {
//         "name": "Summer Breeze",
//         "colors": ["#fbed96", "#abecd6"]
//     },
// ]

// gradients.map((item) => {
//     console.log(item.name, item.colors);
// })


// type Font = { name: string; src: string };

const customFonts = [
    ['xcompany', './fonts/XCompany.ttf'],
    ['creamy sugar', './fonts/CreamySugar-gxnGR.ttf'],
    ['emotional', './fonts/EmotionalRescuePersonalUseRegular-PKY87.ttf'],
    ['glorious', './fonts/GloriousChristmas-BLWWB.ttf'],
    ['grandspace', './fonts/GrandSpaceFreeTrial-lgwmX.otf'],
    ['superfunky', './fonts/SuperFunky-lgmWw.ttf'],
    ['superpencil', './fonts/SuperPencil-ARGw7.ttf'],
    ['superugged', './fonts/SuperRugged-4nBy9.ttf'],
    ['texascrust', './fonts/TexasCrustPersonalUseReg-w1nrw.ttf'],
    ['pumpkin', './fonts/PumpkinTypeHalloween.ttf'],
]


loadFont()

settingsMap.map((item) => {
    if (item['propertyValue'].length) {

        item['propertyValue'].forEach(element => {
            let option = document.createElement('option')
            option.value = element
            option.textContent = element

            item['propertyName'].appendChild(option)
            if (item['propertyName'] === fontStyle) { option.style.fontFamily = element }
        });
    }
});

let x = 0;
let y = 0;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.fillRect(x, y, 150, 150)
    x++
    y++
    window.requestAnimationFrame(animate)
    // animate()
}

// animate()