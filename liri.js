

// npm Modules
require("dotenv").config(); // Require dotenv for Spotify ID and Secret
var fs = require("fs");
var inquirer = require("inquirer");
var axios = require("axios");
var moment = require('moment');
var Spotify = require('node-spotify-api');

// Create spotify Object using our Spotify ID and Secret
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

// Main Variables
var beautifiedDate = "";
var consoleOutput = "";
var logOutput = "";
var timeStamp = moment().format("LT, MMM Do, YYYY")




// Present user with options and get input
function askQuestions(){
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Get Band/Artist Info", "Spotify a Song", "Get Movie Info", "Let Liri decide!"],
            name: "currentCommand"
        },
        {
            // Message if "Get Band/Artist Info" is selected
            type: "input",
            message: 'Great! For which artist or band would you like info?',
            name: "currentParameter",
            when: function (answers) {
                return answers.currentCommand==="Get Band/Artist Info";
            }
        },
        {
            // Message if "Spotify a Song" is selected
            type: "input",
            message: 'Great! For which song would you like info?',
            name: "currentParameter",
            when: function (answers) {
                return answers.currentCommand==="Spotify a Song";
            }
        },
        {
            // Message if "Get Movie Info" is selected
            type: "input",
            message: 'Great! For which movie would you like info?',
            name: "currentParameter",
            when: function (answers) {
                return answers.currentCommand==="Get Movie Info";
            }
        }
            
        
    ]).then(function(answers) {
        command = answers.currentCommand;
        parameter = answers.currentParameter;
        userCommand (command, parameter);
    });
}

// Main Function to determine the option the user selected and then call the relative Function
function userCommand (command, parameter) {
    switch (command) {
        case "Get Band/Artist Info":
            getConcert(parameter);
            break;
        case "Spotify a Song":
            getSpotify(parameter);
            break;
        case "Get Movie Info":
            getMovie(parameter);
            break;
        case "Let Liri decide!":
            getBot();
            break;
    }
}

// Function for "Get Band/Artist Info" selection
function getConcert(parameter) {
    if (parameter=="") {
        parameter = "Metallica";
    }
    axios
    .get("https://rest.bandsintown.com/artists/" + parameter + "/events?app_id=codingbootcamp")
    .then(function(response){

        // Clear the output
        consoleOutput = "";
        for (var i=0; i < response.data.length; i++){
            
            // Create the output
            consoleOutput += "________________________________________________________________________________________________________________________\n\n";
            consoleOutput += "Venue: " + response.data[i].venue.name + "\n";
            if ( response.data[i].venue.region != "") {
                consoleOutput += "Location: " + response.data[i].venue.city + ", " + response.data[i].venue.region + ", " + response.data[i].venue.country + "\n";
            } else {
                consoleOutput += "Location: " + response.data[i].venue.city + ", " + response.data[i].venue.country + "\n";
            }
            beautifiedDate = moment(response.data[i].datetime).format("MMM Do, YYYY");
            consoleOutput += "Date: " + beautifiedDate + "\n";
            consoleOutput += "________________________________________________________________________________________________________________________\n";

        }
        
        // Function to send results
        okStatus(command, parameter, consoleOutput)

    })
    .catch(function(){

        // Function in case of error
        errorStatus("venues");

    });
}

// Function for "Spotify a Song" selection
function getSpotify(parameter) {
    if (parameter=="") {
        parameter = "The Sign";
    }
    spotify
    .search({ type: "track", query: parameter })
    .then(function(response) {
        
        // Clear the output
        consoleOutput = "";
        for (var i=0; i < response.tracks.items.length; i++){

            // Create the output
            consoleOutput += "________________________________________________________________________________________________________________________\n\n";
            consoleOutput += "Artist: " + response.tracks.items[i].artists[0].name + "\n\n";
            consoleOutput += "Song: " + response.tracks.items[i].name + "\n\n";
            consoleOutput += "Preview: " + response.tracks.items[i].preview_url + "\n\n";
            consoleOutput += "Album: " + response.tracks.items[i].album.name + "\n\n";
            consoleOutput += "________________________________________________________________________________________________________________________\n\n";
        }

        // Function to send results
        okStatus(command, parameter, consoleOutput)
        
    })
    .catch(function() {
        
        // Function in case of error
        errorStatus("songs");

    });

}

// Function for "Get Movie Info" selection
function getMovie(parameter) {
    if (parameter=="") {
        parameter = "Mr. Nobody";
    }
    axios
    .get("https://www.omdbapi.com/?t=" + parameter + "&y=&plot=short&apikey=b680b3cf")
    .then(function(response){

        // Clear the output
        consoleOutput = "";

        // Create the output
        consoleOutput += "________________________________________________________________________________________________________________________\n\n";
        consoleOutput += "Title: " + response.data.Title + "\n\n";
        consoleOutput += "Year: " + response.data.Year + "\n\n";
        consoleOutput += "IMDB Rating: " + response.data.Ratings[0].Value + "\n\n";
        for (i=0; i<response.data.Ratings.length; i++) {
            consoleOutput +=  response.data.Ratings[i].Source + " : " + response.data.Ratings[i].Value + "\n\n";    
        }
        consoleOutput += "Country: " + response.data.Country + "\n\n";
        consoleOutput += "Language: " + response.data.Language + "\n\n";
        consoleOutput += "Plot: " + response.data.Plot + "\n\n";
        consoleOutput += "Actors: " + response.data.Actors + "\n\n";
        consoleOutput += "________________________________________________________________________________________________________________________\n\n";
        
        // Function to send results
        okStatus(command, parameter, consoleOutput)

    })
    .catch(function() {
        
        // Function in case of error
        errorStatus("movies");

    });
}

// Function for "Let Liri decide!" selection
function getBot() {
    fs.readFile("random.txt", "utf8", function(error, data) {

        if (error) {
          return console.log(error);
        }
        // Split the String from "random.txt" into an Array
        var dataArr = data.split(",");
        // Call the Main Function with pre-defined parameters
        userCommand(dataArr[0], dataArr[1]);

    });
};

// Log data to log.txt
function logData(command, parameter, result) {
    logOutput += "***********************************************************************************************************************************************************\n\n";
    logOutput += "Logged: " + timeStamp + "\n\n";
    logOutput += "****************************************\n";
    logOutput += "Command: " + command + "\n";
    logOutput += "Search: " + parameter + "\n";
    logOutput += "****************************************\n\n";
    logOutput += "Result:\n";
    logOutput += "=======================================================================================================================================\n";
    logOutput += result + "\n";
    logOutput += "=======================================================================================================================================\n";
    logOutput += "***********************************************************************************************************************************************************\n\n";
    fs.appendFile("log.txt", logOutput, function(err) {
        if (err) {
          console.log(err);
        }
    });
}

// Function in case there is an error or no Results
function errorStatus(type) {
    consoleOutput += "________________________________________\n\n";
    consoleOutput += "No " + type + " found.\n";
    consoleOutput += "________________________________________\n\n";
    // Log the error
    logData(command, parameter, consoleOutput);
    // Display it in the terminal
    console.log(consoleOutput);
}

function okStatus(command, parameter, consoleOutput) {
    // Log the data
    logData(command, parameter, consoleOutput);
    // Display it in the terminal
    console.log(consoleOutput);
}


// Everything starts here
askQuestions();