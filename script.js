// declaring variables outside of functions first
let piano, viola, violin1, cello; // sound file variables
let fftPiano, fftViola, fftViolin1, fftCello; // fft analysis variables
let spectrumPiano, spectrumViola, spectrumViolin1, spectrumCello; // spectrum variables
let levelPiano, levelViola, levelViolin1, levelCello; // "energy" levels (volume) variables
let sizePiano, sizeViola, sizeViolin1, sizeCello; // wave size controller **adapted from ChatGPT, controls the size of each instrument's wave

// variables set to adjust values more easily
let min = 0; // minimum wave size
let max = 40; // maximum wave size
let maxVol = 0.8; // change maximum volume of all instruments

// makes waveform smoother
// smoothing and bins were adapted from a particle system sketch
// source: https://github.com/therewasaguy/p5-music-viz/blob/master/demos/05a_fft_particle_system/sketch.js
let smoothing = 0.6;
let bins = 1024;

function preload() {
  // load necessary audio files and the font before doing anything
  piano = loadSound('piano.mp3');
  cello = loadSound('cello.mp3');
  viola = loadSound('viola.mp3');
  violin1 = loadSound('violin1.mp3');
  font = loadFont('EduTASBeginner.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // link each FFT variable to the audio files
  fftPiano = new p5.FFT(smoothing, bins);
  fftPiano.setInput(piano);
  fftCello = new p5.FFT(smoothing, bins);
  fftCello.setInput(cello);
  fftViolin1 = new p5.FFT(smoothing, bins);
  fftViolin1.setInput(violin1);
  fftViola = new p5.FFT(smoothing, bins);
  fftViola.setInput(viola);
}

function draw() {
  // light yellow background
  background(250, 244, 212);
  // MMB tutorial 3 used to set up waveforms
  // source: https://www.youtube.com/watch?v=mq97oERtUVo
  let waveformPiano = fftPiano.waveform();
  let waveformCello = fftCello.waveform();
  let waveformViola = fftViola.waveform();
  let waveformViolin1 = fftViolin1.waveform();

  // MMB tutorial 3 used to set up waveforms
  // source: https://www.youtube.com/watch?v=mq97oERtUVo
  spectrumPiano = fftPiano.analyze();
  spectrumCello = fftCello.analyze();
  spectrumViola = fftViola.analyze();
  spectrumViolin1 = fftViolin1.analyze();

  // get "energy" levels (volume)
  // documentation: https://p5js.org/reference/#/p5.FFT/analyze
  levelPiano = fftPiano.getEnergy("bass", "highMid");
  levelCello = fftCello.getEnergy("bass", "highMid");
  levelViola = fftViola.getEnergy("bass", "highMid");
  levelViolin1 = fftViolin1.getEnergy("bass", "highMid");

  // controls the size of each instrument's wave
  /*************** start of snippet adapted from ChatGPT ***************/
  sizePiano = map(levelPiano, 0, 255, min, max);
  sizeCello = map(levelCello, 0, 255, min, max*0.5);
  sizeViola = map(levelViola, 80, 255, min, max);
  sizeViolin1 = map(levelViolin1, 80, 255, min, max);
  /*************** end of snippet adapted from ChatGPT ***************/


  // **coordinates here were calculated using ChatGPT & adapted to correct locations
  drawWaveform(waveformPiano, width / 2 - 540, height / 2 - 100, 1270, sizePiano);
  drawWaveform(waveformCello, width / 2 - 540, height / 2, 1270, sizeCello);
  drawWaveform(waveformViola, width / 2 - 540, height / 2 + 100, 1270, sizeViola);
  drawWaveform(waveformViolin1, width / 2 - 540, height / 2 + 200, 1270, sizeViolin1);

  // text styling adapted from tutorial 7: https://www.youtube.com/watch?v=25Fhmqp0KT4
  textAlign(LEFT);
  textFont(font);
  textSize(16);
  noStroke();

  // changes color of the text depending on instrument volumes
  fill(178, 145, 96); // default
  if (piano.getVolume() === 0 && viola.getVolume() === 0 && violin1.getVolume() === 0 && cello.getVolume() === 0) {
    fill(240, 216, 176); // faded
  } else {
    fill(178, 145, 96); // default
  }

  // prints the energy level of each instrument
  text("Piano: " + Math.round(levelPiano), 25, 30);
  text("Cello: " + Math.round(levelCello), 25, 50);
  text("Violin1: " + Math.round(levelViolin1), 25, 70);
  text("Viola: " + Math.round(levelViola), 25, 90);

  // prints the name of each instrument at the beginning of each waveform
  //**coordinates here were calculated using ChatGPT & adapted to correct locations
  textSize(35);
  text("piano", width / 2 - 610, height / 2 - 100);
  text("cello", width / 2 - 610, height / 2);
  text("viola", width / 2 - 610, height / 2 + 100);
  text("violin1", width / 2 - 610, height / 2 + 200);

  // experimented with blend modes to create a circle at the cursor
  // watched this video: https://www.youtube.com/watch?v=fTEvHLLwSBE
  // looked up the blend mode documentation and types: https://www.cs.middlebury.edu/~candrews/classes/cs467-s20-examples/blend-modes/
  blendMode(BURN);
  ellipse(mouseX, mouseY, 50, 50);
  blendMode(BLEND);
}

//**function adapted from ChatGPT
function drawWaveform(waveform, x, y, length, amplitude) {
  // set default stroke color
  // stroke(178, 145, 96);
  stroke(240, 216, 176);
  if (piano.getVolume() === 0 && viola.getVolume() === 0 && violin1.getVolume() === 0 && cello.getVolume() === 0) {
    // change stroke to inactive color
    stroke(240, 216, 176);
  } else {
    // change stroke to active color
    stroke(178, 145, 96);
  }
  noFill();
  strokeWeight(3);

  // creates smoother wave using curved vertex
  /*************** start of snippet adapted from ChatGPT ***************/
  let amp = map(amplitude, 0, 100, 0, 1000);
  beginShape();
  for (let i = 0; i < waveform.length; i += 10) {
    let xPos = map(i, 0, waveform.length, x, x + length);
    let yPos = map(waveform[i], -1, 1, y - amp, y + amp);
    curveVertex(xPos, yPos);
  }
  endShape();
  /*************** end of snippet adapted from ChatGPT ***************/
}

// access the instrument images in the HTML
let pianoImg = document.getElementById('piano');
let celloImg = document.getElementById('cello');
let violin1Img = document.getElementById('violin1');
let violaImg = document.getElementById('viola');

/*************** "getAttribute" was referenced using ChatGPT ***************/
function togglePiano() {
  if (pianoImg.getAttribute('src') === 'piano-col.svg') {
    // if the instrument is grayed out, the volume should be 0
    pianoImg.src = 'piano-gr.svg';
    piano.setVolume(0);
  } else {
    // if the instrument is in color, the volume should be max
    pianoImg.src = 'piano-col.svg'; 
    piano.setVolume(maxVol);
  }
}

// same as togglePiano
function toggleCello() {
  if (celloImg.getAttribute('src') === 'cello-col.svg') {
    celloImg.src = 'cello-gr.svg';
    cello.setVolume(0);
  } else {
    celloImg.src = 'cello-col.svg';
    cello.setVolume(maxVol);
  }
}

// same as togglePiano
function toggleViola() {
  if (violaImg.getAttribute('src') === 'viola-col.svg') {
    violaImg.src = 'viola-gr.svg';
    viola.setVolume(0);
  } else {
    violaImg.src = 'viola-col.svg';
    viola.setVolume(maxVol);
  }
}

// same as togglePiano
function toggleViolin1() {
  if (violin1Img.getAttribute('src') === 'violin1-col.svg') {
    violin1Img.src = 'violin1-gr.svg';
    violin1.setVolume(0);
  } else {
    violin1Img.src = 'violin1-col.svg';
    violin1.setVolume(maxVol);
  }
}
/*************** end of "getAttribute" referenced using ChatGPT ***************/

window.onload = function() {
  // show if loaded
  console.log("loaded");

  // make all instruments clickable
  // when clicked, change the image source and volume
  pianoImg.addEventListener('click', togglePiano);
  celloImg.addEventListener('click', toggleCello);
  violin1Img.addEventListener('click', toggleViolin1);
  violaImg.addEventListener('click', toggleViola);

  // access the volume button in the HTML
  let volButton = document.getElementById('volume-button');

  // toggle the volume button if volume is 0
  volButton.addEventListener('click', function() {
    if (piano.getVolume() > 0 || cello.getVolume() > 0 || viola.getVolume() > 0 || violin1.getVolume() > 0) {
      piano.setVolume(0);
      cello.setVolume(0);
      viola.setVolume(0);
      violin1.setVolume(0);
      volButton.src = 'volume-off.svg';
      console.log("off");
      pianoImg.src = 'piano-gr.svg';
      celloImg.src = 'cello-gr.svg';
      violaImg.src = 'viola-gr.svg';
      violin1Img.src = 'violin1-gr.svg';
    } else {
      piano.setVolume(maxVol);
      cello.setVolume(maxVol);
      viola.setVolume(maxVol);
      violin1.setVolume(maxVol);
      pianoImg.src = 'piano-col.svg';
      celloImg.src = 'cello-col.svg';
      violaImg.src = 'viola-col.svg';
      violin1Img.src = 'violin1-col.svg';
      volButton.src = 'volume-on.svg';
      console.log("on");
    } 
  });

// start button
let start = document.getElementById('play-button');
start.addEventListener('click', function () {
  console.log("start button clicked");
  start.style.display = "none";
  piano.play();
  cello.play();
  viola.play();
  violin1.play();
  piano.setVolume(maxVol); 
  cello.setVolume(maxVol); 
  viola.setVolume(maxVol);
  violin1.setVolume(maxVol); 
  console.log("playing");
  celloImg.src = 'cello-col.svg';
  violaImg.src = 'viola-col.svg';
  violin1Img.src = 'violin1-col.svg';
  pianoImg.src = 'piano-col.svg';
  volButton.src = 'volume-on.svg';
});
};

// taken from my assignment 2 sketch, which is based on http://www.generative-gestaltung.de
// documentation: https://p5js.org/reference/#/p5/keyPressed
function keyPressed() {
  if (key == ' ') {
    piano.play();
    cello.play();
    viola.play();
    violin1.play();
    piano.setVolume(maxVol); 
    cello.setVolume(maxVol); 
    viola.setVolume(maxVol);
    violin1.setVolume(maxVol); 
    piano.loop();
    cello.loop();
    viola.loop();
    violin1.loop();
    console.log("playing");
  }
}

// function adapted from https://github.com/therewasaguy/p5-music-viz/blob/master/demos/05a_fft_particle_system/sketch.js 
// resizes window so p5.js shapes and text don't warp
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  document.getElementById('container').style.width = windowWidth * 1 + 'px';
  document.getElementById('container').style.height = windowHeight * 1 + 'px';
}