/*************************************************
 * THIS SECTION OF CODE IS FOR FRONT END UI CODE
 *************************************************/

/*
 * This function changes the bpm of the metronome
 */
function changeBPM(userBPM) {

    // check if userBPM is an integer
    if (isInteger(userBPM)) {
        bpm = userBPM;
    }

    else {
        console.log("Please enter an integer");
    }
    console.log('bpm = ' + userBPM);
}

function printNotes(instrument) {
    var barLength = 0;
    var strOutput = "";
    
    for (var i=0; i<instrument.InstrumentNotes.length;i++){
        var noteMidi = instrument.InstrumentNotes[i].midi;
        var noteValue = lengthToLetter(instrument.InstrumentNotes[i].noteValue);
        
        strOutput = strOutput + noteMidi + noteValue + " ";
        
        barLength = barLength + instrument.InstrumentNotes[i].noteValue;
        
        if(barLength%4 == 0 && i != instrument.InstrumentNotes.length-1){
            strOutput = strOutput + " | ";
        }
    }
    
    return strOutput;
}


function lengthToLetter(noteValue){
    var noteValueLength = 0;
    switch(noteValue) {
        case 1/3:
            noteValueLength = 't';
            break;
        case 0.5:
            noteValueLength = 'e';
            break;
        case 1:
            noteValueLength = 'q';
            break;
        case 2:
            noteValueLength = 'h';
            break;
        case 4:
            noteValueLength = 'w';
            break;
    }
    return noteValueLength;
}

/*
 * Auxilliary Functions
 */
function isInteger(x) {
    return x % 1 === 0;
}


function hush() {
    console.log("This muted the instruments");
    
    BassInstrument.gainNode.gain.value = 0;
    MelodyInstrument.gainNode.gain.value = 0;
    HarmonyInstrument.gainNode.gain.value = 0;
    TextureInstrument.gainNode.gain.value = 0;
}

function stop() {
    console.log("This stopped the instruments");
    
    BassInstrument.InstrumentNotes = []; 
    MelodyInstrument.InstrumentNotes = []; 
    HarmonyInstrument.InstrumentNotes = [];
    TextureInstrument.InstrumentNotes = [];
}

function turnt() {
    console.log("This unmutes the instruments");
    
    BassInstrument.gainNode.gain.value = 0.2;
    MelodyInstrument.gainNode.gain.value = 0.7;
    HarmonyInstrument.gainNode.gain.value = 0.1;
    TextureInstrument.gainNode.gain.value = 0.2;
}                     


function midiToFreq(midi) {
    var freq = Math.pow(2,(midi-69)/12) * 440;
    return freq
}

function notevalueToSec(noteValue) {
    // Calculating how long each beat is
    var beatDelay = 60.0/bpm;
    
    // Calculating in seconds how long the note is
    return (beatDelay * noteValue);
}

function fillBarWithRest(instrument, barLength) { 
    var beatsPerBar = 4;
    
    var noBeats = 0;
    var noBar = 1;
    
    while(noBeats < barLength) {
        noBeats = noBar*beatsPerBar;
        noBar++;
    }
    
    var restValue = noBeats - barLength;
    
    if(restValue != 0){
        var noteToAdd = new note();
        noteToAdd.noteValue = restValue;
        noteToAdd.midi = 0;
        
        console.log("Rest value is: " + restValue);

        instrument.InstrumentNotes.push(noteToAdd);
    }
    
}

function resumeInstruments(){
    BassInstrument.nextNote = context.currentTime;
    MelodyInstrument.nextNote = context.currentTime;
    HarmonyInstrument.nextNote = context.currentTime;
    TextureInstrument.nextNote = context.currentTime;
}

function changeGain(instrument, gain) {
    console.log("change gain");
    var gainValue = gain.trim();
    
    switch( instrument ) {
        case 'bass':
            BassInstrument.gainNode.gain.value = gainValue;
            console.log("BASS GAIN");
            break; 
            
        case 'melody':
            MelodyInstrument.gainNode.gain.value = gainValue;
            console.log("MELODY GAIN");
            break;
            
        case 'harmony':
            HarmonyInstrument.gainNode.gain.value = gainValue;
            console.log("HARMONY GAIN");
            break;
        
        case 'texture':
            TextureInstrument.gainNode.gain.value = gainValue;
            console.log("TEXTURE GAIN");
            break;
    }
}

// This function determines out of the 4 instruments, which to insert notes into
function addNotesToInstrument(instrument, notes) {
    switch( instrument ) {
        case 'bass':
            BassInstrument.nextNote = context.currentTime;
            BassInstrument.currentNote = 0;
            BassInstrument.InstrumentNotes = [];
            
            addBars(BassInstrument, notes);
            console.log("ADD NOTES TO BASS INSTRUMENT");
            break; 
            
        case 'melody':
            MelodyInstrument.nextNote = context.currentTime;
            MelodyInstrument.currentNote = 0;
            MelodyInstrument.InstrumentNotes = [];
    
            addBars(MelodyInstrument, notes);
            console.log("ADD NOTES TO MELODY INSTRUMENT");
            break;
            
        case 'harmony':
            HarmonyInstrument.nextNote = context.currentTime;
            HarmonyInstrument.currentNote = 0;
            HarmonyInstrument.InstrumentNotes = [];
    
            addBars(HarmonyInstrument, notes);
            console.log("ADD NOTES TO HARMONY INSTRUMENT");
            break;
            
        case 'texture':
            TextureInstrument.nextNote = context.currentTime;
            TextureInstrument.currentNote = 0;
            TextureInstrument.InstrumentNotes = [];
    
            addBars(TextureInstrument, notes);
            console.log("ADD NOTES TO TEXTURE INSTRUMENT");
            break;
    }
    checkLongestLength();
    console.log("Longest Length: " + longestLength);
}

// This function splits the notes by bars using '|' and sends in the bars one at a time
function addBars(instrument, notes) {
    instrument.active = false;
    bar = notes.split('|');
    
    for (var i = 0; i<bar.length; i++){
        console.log("BAR " + i + " : " + bar[i]);
        bar[i] = bar[i].trim();
        addNotes(instrument, bar[i]);
    }
    
    instrument.active = true;
}

// This function takes one bar and splits it into multiple notes and send in notes one at a time
function addNotes(instrument, bar){
    notes = bar.split(' ');
        
    currentBarLength = 0;
    
    for (var i=0; i<notes.length; i++){
        console.log("Notes " + notes[i]);
        notes[i].trim();
        addNote(instrument, notes[i]);
    }
    //fill rest of bar with rests
    fillBarWithRest(instrument, currentBarLength);
}

var currentBarLength;
// This function takes in each of the user's notes one at a time and creates one note
function addNote(instrument, inputNote){
    noteMidi = parseInt(inputNote);
    noteValue = inputNote.charAt(inputNote.length-1);
    
    var noteToAdd = new note();
    if (noteMidi == parseInt(noteMidi, 10)){
        noteToAdd.midi = noteMidi;   
    }
    else{
        noteToAdd.midi = 0;   
    }
    noteToAdd.noteValue = letterToLength(noteValue);
    
    currentBarLength = currentBarLength + noteToAdd.noteValue;

    instrument.InstrumentNotes.push(noteToAdd);
    
    console.log("midi: " + noteToAdd.midi + ", letter: " + noteToAdd.noteValue);
}
    
function letterToLength(noteValue){
    var noteValueLength = 0;
    switch(noteValue) {
            
       /*
        * case 't':
        *   noteValueLength = 1/3; // a case for triplet note design, to be completed in future
        *   break; 
        */
            
        case 'e':
            noteValueLength = 0.5; // eight note
            break;
            
        case 'q':
            noteValueLength = 1; // quarter note
            break;
            
        case 'h':
            noteValueLength = 2; // half note
            break;
            
        case 'w':
            noteValueLength = 4; // whole note
            break;
            
    }
    return noteValueLength;
}

function checkLongestLength() {
    var longestInstrumentLength = 0;
    
    for (var i=0; i<instrumentArray.length; i++) {
        var instrumentLength = instrumentArray[i].InstrumentNotes.length;
        
        if(instrumentLength >= longestInstrumentLength){
            longestInstrumentLength = instrumentLength;
        }
    }
    longestLength = longestInstrumentLength;
}

var longestLength = 0;
function restartInstrumentBar(instrument, instrumentLength) {
    
    if(instrumentLength >= longestLength) {
        for (var i=0; i<instrumentArray.length; i++) {
            instrumentArray[i].currentNote = 0;
            instrumentArray[i].nextNote = context.currentTime;
            instrumentArray[i].active = true;
        }
    }
    else {
        instrument.currentNote = 0;    
    }
}

function instrumentParser(command) {
    // command[0] = Bass.gain
    // command[1] = ' 2'
    
    var beb = command[0].split('.');
    beb[1] = beb[1].trim();
    // beb[0] = Bass 
    // beb[1] = gain
    // command[1] = 2
    
    switch( beb[1] ) {
        case 'gain':
            changeGain(beb[0], command[1]);
            console.log("change gain intro");
            break;
        case 'notes':
            addNotesToInstrument(beb[0], command[1]);
            console.log("change notes");
            printConsole();
            break;
    }
    printConsole();
    
}

/*
 * This function is the main parser for WASP
 */

function parse() {
    // command is 'Bass.Gain = 2'
    // command[0] = Bass.gain
    // command[1] = 2
    var userCMD = document.getElementById("commandBox").value;
    
    // command is an array with user submitted string
    var command = userCMD.split('=');
    var functionName = command[0].trim().toLowerCase();
    
    switch( functionName ) {
        case 'tempo':
            changeBPM(command[1]);
            console.log("TEMPO");
            break;
        
        case 'boot':
            startMetronome();
            console.log("BOOT");
            break;
            
        case 'starwars':
            songStarWars();
            console.log("STARWARS");
            break;           
            
        case 'hush':
            hush();
            console.log("HUSH");
            break;
            
        case 'stop':
            stop();
            console.log("STOP");
            break;
            
        case 'turnt':
            turnt();
            console.log("TURNT");
            break;
            
        case 'pause':
            isPaused = true;
            console.log("PAUSE");
            break;
            
        case 'play':
            isPaused = false;
            resumeInstruments();
            console.log("PLAY");
            break;
        
        default:
            instrumentParser(command);
            console.log("INSTRUMENT PARSER");
            break;  
    }   
    printConsole();
}


/*************************************************
 * THIS SECTION OF CODE IS FOR INSTRUMENTS 
 * AND WEB AUDIO API CODE
 *************************************************/

var context = null;


/*
 * These are common classes to be used 
 */
function Instrument() {
	this.gainNode = context.createGain();
	this.oscillator = context.createOscillator();
	this.filter = context.createBiquadFilter();
	this.shape = context.createWaveShaper();
    
    this.active = false;
    
    this.InstrumentNotes;   // Array to hold notes in a bar
    this.nextNote;          // Variable to remember when the nextNote is played
    this.currentNote;       // Variable to remember which note in the bar is being played
}

function note() {
    this.midi;
    this.noteValue = 0;
    
    this.attack;
    this.sustain;
    this.release;
}

var instrumentArray = [];
/*
 * This area is for defining instruments
 */
var BassInstrument;
var MelodyInstrument;
var HarmonyInstrument;

function initBassInstrument(){
    BassInstrument = new Instrument();
    
	BassInstrument.oscillator.type = "sine";

	BassInstrument.gainNode.gain.value = 0.2;
    
    BassInstrument.InstrumentNotes = [];
    
    BassInstrument.nextNote = context.currentTime;
    BassInstrument.currentNote = 1;
}

function initMelodyInstrument(note) {
    MelodyInstrument = new Instrument();

    MelodyInstrument.oscillator.type = "triangle";

    MelodyInstrument.gainNode.gain.value = 0.7;

    MelodyInstrument.filter.type = 'lowpass';
    MelodyInstrument.filter.frequency.value = 220;
    
    MelodyInstrument.InstrumentNotes = [];
    MelodyInstrument.nextNote = context.currentTime;
    MelodyInstrument.currentNote = 1;
}

function initHarmonyInstrument(note){
	HarmonyInstrument = new Instrument();

	HarmonyInstrument.oscillator.type = "square";
    
    HarmonyInstrument.gainNode.gain.value = 0.2;
    
    HarmonyInstrument.filter.type = 'lowpass';
    HarmonyInstrument.filter.frequency.value = 100;
    
    HarmonyInstrument.InstrumentNotes = [];
    HarmonyInstrument.nextNote = context.currentTime;
    HarmonyInstrument.currentNote = 1;
}

function initTextureInstrument(note) {
    TextureInstrument = new Instrument();

	TextureInstrument.oscillator.type = "sawtooth";
    
    TextureInstrument.gainNode.gain.value = 0.1;
    
    TextureInstrument.filter.type = 'lowpass';
	TextureInstrument.oscillator.frequency.value = 70;
    
    TextureInstrument.InstrumentNotes = [];
    TextureInstrument.nextNote = context.currentTime;
    TextureInstrument.currentNote = 1;
}


/*
 * These 3 functions are used to play a note given the instrument and the note
 */

var isPaused = false;

function instrumentScheduler(instrument) {
    if (!isPaused && instrument.InstrumentNotes.length != 0) {
        while(instrument.nextNote < (context.currentTime + 0.1)) {

            // repeat bar if at the end of bar
            if (instrument.currentNote == instrument.InstrumentNotes.length) {
                restartInstrumentBar(instrument, instrument.InstrumentNotes.length);
                //instrument.currentNote = 0;   
            }
            //if (instrument.active) {
                playInstrument(instrument, instrument.InstrumentNotes[instrument.currentNote]);
            //}
            calcNextNote(instrument ,instrument.InstrumentNotes[instrument.currentNote]);
            instrument.currentNote++;
        }
    }
}

function playInstrument(instrument, note) {
    console.log("Playing: " + instrument.oscillator.type + " Note: " + instrument.currentNote + " With length "  + instrument.InstrumentNotes.length + " with midi: " + note.midi + " note value: " + note.noteValue);
    if (note.midi != 0) {
        var soundNode = new Instrument();

        soundNode.oscillator.type = instrument.oscillator.type;
        soundNode.oscillator.frequency.value = midiToFreq(note.midi);
        soundNode.oscillator.connect(soundNode.gainNode);

        soundNode.gainNode.gain.value = instrument.gainNode.gain.value;
        soundNode.gainNode.connect(context.destination);

        soundNode.oscillator.start(context.currentTime);
        soundNode.oscillator.stop(context.currentTime+notevalueToSec(note.noteValue)-0.05);
    }
}

function calcNextNote(instrument, note) {
    
    // Calculating in seconds how long the note is
    noteDelay = notevalueToSec(note.noteValue);
    
    // Adds the delay for the next note to be played
    instrument.nextNote = context.currentTime + noteDelay;
}

/* 
 * A function to manage the tone of the note
 * IN: 
 *  noteStartTime: Start time of specific note
 *  instrument: Which instrument to apply compression to
 *  attack: How long note should take to get to full gain (in sec)
 *  sustain: How long note should stay at full gain (in sec)
 *  release: How long note should take to get to 0 from full gain (in sec)
 *  decay: How much of full gain note should decay to (not implemented yet)
 * FUNC: Will apply attack, sustain, release to notes.
 * OUT: null
 */

function compressor(noteStartTime, instrument, attack, sustain, release, decay) {

    // Start increasing the gain
    console.log("Ramping up at " + context.currentTime);
    instrument.gainNode.gain.linearRampToValueAtTime(5, noteStartTime+attack);

    // Decrease gain after attack and sustain
    setTimeout( function() {
        console.log("Ramping down at " + context.currentTime);
        instrument.gainNode.gain.linearRampToValueAtTime(0, noteStartTime+(attack+sustain+release));
    }, (attack + sustain) * 1000);
}

// Variables used for metronome and scheduler
var tickActive = true;				//Used to toggle Metronome on/off

var bpm = 90.0;					    //bpm defaulted at 60
var nextTickTime = 0.0;				//Used to schedule notes
var rhythmIndex = 0;				//Used to keep track of where we are in the bar


function startMetronome(){
    context = new AudioContext();
	console.log("This metronome is starting");

    initBassInstrument();
    initMelodyInstrument();
    initHarmonyInstrument();
    initTextureInstrument();
    
    instrumentArray.push(BassInstrument);
    instrumentArray.push(MelodyInstrument);
    instrumentArray.push(HarmonyInstrument);
    instrumentArray.push(TextureInstrument);

    //checkLongestLength();
    console.log("Longest Length: " + longestLength);
    printConsole();   
    
    setInterval("instrumentScheduler(BassInstrument)",20);
    setInterval("instrumentScheduler(MelodyInstrument)",20);
    setInterval("instrumentScheduler(HarmonyInstrument)",20);
    setInterval("instrumentScheduler(TextureInstrument)",20);
                
}

/*
 * This function is the design for the print console window
 */

function printConsole() {
    
    var console = "";
    console = printSystem(console);
    console = printInstrument(console, BassInstrument, "BassInstrument");
    console = printInstrument(console, MelodyInstrument, "MelodyInstrument");
    console = printInstrument(console, HarmonyInstrument, "HarmonyInstrument");
    console = printInstrument(console, TextureInstrument, "TextureInstrument");
    
    document.getElementById("consoleBox").value = console;
    
}

function printSystem(consoleStr) {
    
    consoleStr = consoleStr + "WELCOME TO WASP! \n\n";
    
    consoleStr = consoleStr + "   Pause: " + isPaused + "\n";
        
    consoleStr = consoleStr + "\n\n";
    return consoleStr;
}

function printInstrument(consoleStr, instrument, instrumentName) {
    
    consoleStr = consoleStr + instrumentName + "\n";
    consoleStr = consoleStr + "   Notes: " + printNotes(instrument) + "\n";
    consoleStr = consoleStr + "   Gain: " + instrument.gainNode.gain.value + "\n";
    
    consoleStr = consoleStr + "\n\n";
    return consoleStr;
}


/*
 * This function is just for fun, and plays the starwars intro theme
 */

function songStarWars() {
    
    BassInstrument.InstrumentNotes = [];
    MelodyInstrument.InstrumentNotes = [];
    
    BassInstrument.currentNote = 0;
    MelodyInstrument.currentNote = 0;
    
    melodylowLongA = new note();
    melodylowLongA.midi = 57;
    melodylowLongA.noteValue = 2;
    
    melodylowLongG = new note();
    melodylowLongG.midi = 55;
    melodylowLongG.noteValue = 2;
    
    melodyhighLongD = new note();
    melodyhighLongD.midi = 62;
    melodyhighLongD.noteValue = 2;
    
    melodyhighLongG = new note();
    melodyhighLongG.midi = 79;
    melodyhighLongG.noteValue = 2;
    
    melodyhighShortD = new note();
    melodyhighShortD.midi = 62;
    melodyhighShortD.noteValue = 1;
    
    melodyhighTripC = new note();
    melodyhighTripC.midi = 72;
    melodyhighTripC.noteValue = 1/3;
    
    melodyhighTripB = new note();
    melodyhighTripB.midi = 71;
    melodyhighTripB.noteValue = 1/3;
    
    melodyhighTripA = new note();
    melodyhighTripA.midi = 69;
    melodyhighTripA.noteValue = 1/3;
    
    melodylowDoubTripD = new note();
    melodylowDoubTripD.midi = 50;
    melodylowDoubTripD.noteValue = 2/3;
    
    melodylowTripD = new note();
    melodylowTripD.midi = 50;
    melodylowTripD.noteValue = 1/3;
    
    
    MelodyInstrument.InstrumentNotes[0] = melodylowLongG;
    MelodyInstrument.InstrumentNotes[1] = melodyhighLongD;
    MelodyInstrument.InstrumentNotes[2] = melodyhighTripC;
    MelodyInstrument.InstrumentNotes[3] = melodyhighTripB;
    MelodyInstrument.InstrumentNotes[4] = melodyhighTripA;
    MelodyInstrument.InstrumentNotes[5] = melodyhighLongG;
    MelodyInstrument.InstrumentNotes[6] = melodyhighShortD;
    MelodyInstrument.InstrumentNotes[7] = melodyhighTripC;
    MelodyInstrument.InstrumentNotes[8] = melodyhighTripB;
    MelodyInstrument.InstrumentNotes[9] = melodyhighTripA;
    MelodyInstrument.InstrumentNotes[10] = melodyhighLongG;
    MelodyInstrument.InstrumentNotes[11] = melodyhighShortD;
    MelodyInstrument.InstrumentNotes[12] = melodyhighTripC;
    MelodyInstrument.InstrumentNotes[13] = melodyhighTripB;
    MelodyInstrument.InstrumentNotes[14] = melodyhighTripC;
    MelodyInstrument.InstrumentNotes[15] = melodylowLongA;
    MelodyInstrument.InstrumentNotes[16] = melodylowDoubTripD;
    MelodyInstrument.InstrumentNotes[17] = melodylowTripD;
    
    basshighShortG = new note();
    basshighShortG.midi = 43+12;
    basshighShortG.noteValue = 1;
    
    basshighShortF = new note();
    basshighShortF.midi = 42+12;
    basshighShortF.noteValue = 1;
    
    basshighShortFn = new note();
    basshighShortFn.midi = 41+12;
    basshighShortFn.noteValue = 1;
    
    basshighShortE = new note();
    basshighShortE.midi = 40+12;
    basshighShortE.noteValue = 1;
    
    basshighShortD = new note();
    basshighShortD.midi = 38+12;
    basshighShortD.noteValue = 1;
    
    basshighShortC = new note();
    basshighShortC.midi = 36+12;
    basshighShortC.noteValue = 1;
    
    basshighShortB = new note();
    basshighShortB.midi = 35+12;
    basshighShortB.noteValue = 1;
    
    basshighShortA = new note();
    basshighShortA.midi = 33+12;
    basshighShortA.noteValue = 1;
    basshighShortA.length = 1;
    
    basslowShortG = new note();
    basslowShortG.midi = 31+12;
    basslowShortG.noteValue = 1;
    
    basshighShortDf = new note();
    basshighShortDf.midi = 38+12;
    basshighShortDf.noteValue = 2;
    
    BassInstrument.InstrumentNotes[0] = basshighShortG;
    BassInstrument.InstrumentNotes[1] = basshighShortF;
    BassInstrument.InstrumentNotes[2] = basshighShortE;
    BassInstrument.InstrumentNotes[3] = basshighShortD;
    BassInstrument.InstrumentNotes[4] = basshighShortC;
    BassInstrument.InstrumentNotes[5] = basshighShortB;
    BassInstrument.InstrumentNotes[6] = basshighShortA;
    BassInstrument.InstrumentNotes[7] = basslowShortG;
    BassInstrument.InstrumentNotes[8] = basshighShortC;
    BassInstrument.InstrumentNotes[9] = basshighShortB;
    BassInstrument.InstrumentNotes[10] = basshighShortA;
    BassInstrument.InstrumentNotes[11] = basslowShortG;
    BassInstrument.InstrumentNotes[12] = basshighShortFn;
    BassInstrument.InstrumentNotes[13] = basshighShortD;
    BassInstrument.InstrumentNotes[14] = basshighShortDf;

}
