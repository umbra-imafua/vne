//elements accessed in the html file
var stage = document.querySelector('.stage'); 
var background = document.querySelector('.background');
var textbox = document.querySelector('.textbox'); 
var debugbox = document.querySelector('.debug');

//variables used at runtime and save
var script_source = ""; //the source file for the script
var script = []; //the array we will store the lines of the script in

var line = 0; //The current line being read
var speaker = ""; //The character that is speaking


//load the script named "_start" on init unless we have TODO a different current script saved in the url
load_script("_start",0,true);

//loads a script file into the array "script"
function load_script(load_script, load_line=0, progress_once=false){

    script_source = ("/scripts/" + load_script + ".txt")//finds the script path from the script name

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", script_source, false); //start loading the file
    rawFile.onreadystatechange = function (){
        debug("Loading "+ script_source + " _ status: " + rawFile.readyState); //debug the loading proccess

        if(rawFile.readyState === 4){
            if(rawFile.status === 200 || rawFile.status == 0){ //the file is done loading

                var script_raw = rawFile.responseText; //get the file as a string

                script = script_raw.split('\n'); //split the lines of that string into an array
                
                line = load_line-1 //prep the line position for updating on next progress

                debug("Loaded "+String(script.length)+" lines from "+script_source+"."); //debug a good load

                if(progress_once){progress();}
            }
        }
    }
    rawFile.send(null);
}

//calls function 'progress' on click or space (keyCode32) pressed
document.addEventListener('click', function( click ) { if (click.target) { progress(); }});
document.addEventListener("keypress", function(key) { if(key.keyCode == 32){ progress(); }});

//fuction that progresses through the script
function progress(){
    line+=1;
    
    if(script[line].charAt(0) == "@"){ //The @ symbol sets a new speaker
        speaker = script[line].substr(1, 50);
        debug("speaker set to " + script[line].substr(1, 50));
        progress();
    }else if(script[line].charAt(0) == "¬"){ //The ¬ symbol executes javascript directly from the script
        new Function(script[line].substr(1, 10000))();
        debug("executing script (" + script[line].substr(1, 10000) + " )");
        progress();
    }else if(script[line].charAt(0) == "%"){ //The % symbol sets the background image
        background.style.backgroundImage = "url('/backgrounds/" + script[line].substr(1, 10000)+'\')';
        debug("set background image to " + script[line].substr(1, 10000));
        progress();
    }else if(script[line].charAt(0) == ">"){ //The > symbol sets a characters emotion and adds their spite if not loaded
        if(document.querySelector('.'+speaker)){
            newimage = document.querySelector('.'+speaker);
        }else{
            var newimage = new Image();          
            stage.appendChild(newimage);
            newimage.classList.add(speaker);   
            debug("added character " + speaker);      
        } 
        newimage.src = ("/sprites/" + speaker + "/" + script[line].substr(1, 50));
        debug("set character " + speaker + " emotion to " + script[line].substr(1, 50));
        progress();
    }else if(script[line].charAt(0) == "<"){ //The < symbol removes a character from the scene
        if(document.querySelector('.'+speaker)){
            document.querySelector('.'+speaker).remove();
        }
        debug("removed character " + speaker);
        progress();
    }else if(script[line].charAt(0) == "~"){ //The ~ plays a sound in a tempory audioplayer
        var audio = new Audio("/sounds/" + script[line].substr(1, 10000));
        audio.play();
        debug("playing audio " + script[line].substr(1, 10000) + " in " + audio);
        progress();
    }else if(script[line].charAt(0) == "&"){ //The & symbol gives a scene to choose, the = symbol indicated the scene filename
        var button = document.createElement("button");
        button.innerHTML = script[line].substr(1, 10000).split('=')[0];
        button.classList.add('choice')
        stage.appendChild(button);

        var target = script[line].substr(1, 10000).split('=')[1];

        button.addEventListener ("click", function() {
            load_script(target);
            document.querySelectorAll('.choice').forEach(e => e.remove());
        });
        progress();
    }else{
        textbox.id = speaker;//If no special symbol is present, print the text as speach
        textbox.innerHTML = "<h3>" + speaker.replace(/_/g, " ") + "</h3>" + script[line];
    }
}

//forwards a string to the debug messages
function debug(message = " - - - "){
    debugbox.innerHTML = new Date().toLocaleTimeString() + ": " + String(message) + "<br>" + debugbox.innerHTML;
}