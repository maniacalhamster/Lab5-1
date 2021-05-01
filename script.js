// script.js

// Define the canvas, context, and img variables used to load images from input
const canvas    = document.getElementById('user-image');
const context   = canvas.getContext('2d');
const img       = new Image(); // used to load image from <input> and draw to canvas

// <Choose File> button, will be used to grab the image selected by user
const img_inp   = document.getElementById('image-input');

// Define the 2 text input boxes as well as the combined text that the voice will read 
// (ensures voice reads meme text, not whatevers in the input textboxes)
const text_top      = document.getElementById('text-top');
const text_bottom   = document.getElementById('text-bottom');
var combined_text   = '';

// Form itself will be submitted when user clicks on <Generate> button
// Also avoid the default query param GET action performed onsubmit with a 'function' that returns false
const form          = document.getElementById('generate-meme');
form.onsubmit       = () => { return false };

// Define all the buttons on the page, by type, which will be toggled ON/OFF
// Different buttons are found by using a query selector by type
const generate_btn  = document.querySelector('button[type=submit]');
const clear_btn     = document.querySelector('button[type=reset]');
const read_text_btn = document.querySelector('button[type=button]');

// Voice-selection drop down, will be toggled alongside the clear and read-text buttons
// Use window's speech sythesis to fill the drop down (call helper once voices are loaded!)
const voice_options = document.querySelector('select');
window.speechSynthesis;
setTimeout(populateVoiceList, 1);

// Define the volume slider and image, both found with query selector
// Also define the volume that will be controlled (initially 100)
const volume_img    = document.querySelector('img');
const volume_slider = document.querySelector('input[type=range]');
var volume          = 100;

// When user selects an image (changes the input), load the img var with it!
img_inp.addEventListener('change', () => {
    let file    = img_inp.files[0];
    img.src     = URL.createObjectURL(file);
});

// On submission: 
// - Use values of text input to draw text on canvas
// - Toggle relevant buttons (Generate - OFF, Clear & Read Text - ON)
form.addEventListener('submit', () => {
    writeText();
    toggle_buttons();
});

// On clear:
// - Clear the canvas
// - Clear the image input of all files
// - Toggle relevant buttons (Generate - ON, Clear & Read Text - OFF)
clear_btn.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    img_inp.value = '';
    toggle_buttons();
});

// On read text:
// - Create a new utterance with the text input 
// - Assign selected voice
// - Assign selected volume
// - Call on speechSynthesis' speak function
read_text_btn.addEventListener('click', () => {
    let reader          = new SpeechSynthesisUtterance(combined_text);
    let selected_voice  = window.speechSynthesis.getVoices()[voice_options.selectedIndex];

    reader.voice  = selected_voice;
    reader.volume = volume;

    speechSynthesis.speak(reader);
});

// On volume slider change:
// - Update the value of volume
// - Update the volume img to correct icon
volume_slider.addEventListener('change', () => {
    volume = volume_slider.value / 100;

    // Build the path to the correct icon based off new volume value
    let path = './icons/volume-level-';

    if (volume >= 0.67) {
        path += '3';
    } else if (volume >= 0.34) {
        path += '2';
    } else if (volume >= 0.01) {
        path += '1';
    } else {
        path += '0';
    }

    path += '.svg';

    volume_img.src = path;
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
    // Some helpful tips:

    // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // scale the image to fit the canvas using a helper function
    let dims = getDimmensions(canvas.width, canvas.height, img.width, img.height);
    context.drawImage(img, dims.startX, dims.startY, dims.width, dims.height);

    // - Clear the form when a new image is selected
    // - If you draw the image to canvas here, it will update as soon as a new image is selected
        // ^ these instructions are a bit weird since drawing the black background
        // and new image over would have the same result, I think clearing the 
        // form is for later, when the user clicks on the 'Clear' button
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
    let aspectRatio, height, width, startX, startY;

    // Get the aspect ratio, used so the picture always fits inside the canvas
    aspectRatio = imageWidth / imageHeight;

    // If the apsect ratio is less than 1 it's a verical image
    if (aspectRatio < 1) {
        // Height is the max possible given the canvas
        height = canvasHeight;
        // Width is then proportional given the height and aspect ratio
        width = canvasHeight * aspectRatio;
        // Start the Y at the top since it's max height, but center the width
        startY = 0;
        startX = (canvasWidth - width) / 2;
        // This is for horizontal images now
    } else {
        // Width is the maximum width possible given the canvas
        width = canvasWidth;
        // Height is then proportional given the width and aspect ratio
        height = canvasWidth / aspectRatio;
        // Start the X at the very left since it's max width, but center the height
        startX = 0;
        startY = (canvasHeight - height) / 2;
    }

    return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

// Helper function for writing the text from input to the meme
// Text will be 48px, black outline on white text in a blocky font
function writeText() {
    // Set the combined text during meme generation so voice will read correctly
    combined_text = text_top.value + text_bottom.value;

    context.fillStyle='white';
    context.font = '48px fantasy';

    // horizontally align the text
    context.textAlign='center';

    // Both top and bottom text are written twice, first with a white fill and then a 
    // black outline (has a transparent fill) on top

    // Align text to top for a clean allignment for top text - a 5px margin is added for good measure
    context.textBaseline = 'top';
    context.fillText(text_top.value, canvas.width/2, 5);
    context.strokeText(text_top.value, canvas.width/2, 5);

    // Align text to bottom for a clean allignment for bottom text - 5px margin added for good measure
    context.textBaseline = 'bottom';
    context.fillText(text_bottom.value, canvas.width/2, canvas.height - 5);
    context.strokeText(text_bottom.value, canvas.width/2, canvas.height - 5);
}

// Toggles buttons and dropdowns
// (Generate button) vs (clear, read text buttons, voice options drop down)
// While one is ON, the others are OFF - both groups just swap off
function toggle_buttons() {
    clear_btn.disabled      = generate_btn.disabled;
    read_text_btn.disabled  = generate_btn.disabled;
    voice_options.disabled  = generate_btn.disabled;

    generate_btn.disabled   = !generate_btn.disabled;
}

// Helper function to populate the list of available voices
// - Iterate through each voice: 
//      - create an option element
//      - apply attributes for name and lang
//      - update the inner text (for user) with both attributes
//      - append it to list of options
// Also remove the 'no voices available' option
function populateVoiceList() {
    window.speechSynthesis.getVoices().forEach((voice) => {
        var option = document.createElement('option');

        option.innerText = voice.name + ' (' + voice.lang + ')';

        // Specially mark the default voice option 
        if(voice.default) {
            option.innerText += ' -- DEFAULT';
            option.selected = true;
        }

        option.setAttribute('data-lang', voice.lang);
        option.setAttribute('data-name', voice.name);

        voice_options.appendChild(option);
    });
    voice_options.remove(0);
}