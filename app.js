var keys = require("./keys.js");
var request = require('request');
var Spotify = require('node-spotify-api');
var fs = require("fs");

var firstArray = process.argv;

var command = process.argv[2];

// Empty string variable
var arg = "";

// Appends empty string
for (var i = 3; i < firstArray.length; i++) {
  if (i > 3 && i < firstArray.length) {
    arg = arg + "+" + firstArray[i];
  }
  else {
    arg = firstArray[i];
  }
}

// Calls different functions with switch
switch (command) {
  case "spotify-a-song":
    spotifyThisSong(arg);
    break;
  case "movie-search":
    movieInfo(arg);
    break;
  case "search-it":
    followItYaDingus();
    break;
  default:
    console.log("Try using the right input ya dingus");
}

// Function to show song based on search input
function spotifyThisSong(query) {
  
  // Creates an instance with spotify data
  var spotify = new Spotify({
    id: keys.spotify_id,
    secret: keys.spotify_secret
  });

  // If no input, Michael McDonald
  if (!query) {
    query = "What+A+Fool+Believes";
  } else {
    query = query;
  }

  // Calls the spotify functino
  spotify.search({ type: 'track', query: query, limit: 1 }, function(error, data) {
    // Log any error
    if (error) {
      console.log(error);
    } else {

      // Else store responses
      var song = data["tracks"]["items"][0]["name"];
      var artist = data["tracks"]["items"][0]["artists"][0]["name"];
      var previewURL = data["tracks"]["items"][0]["preview_url"];
      var album = data["tracks"]["items"][0]["album"]["name"];

      // Log data
      console.log("Song name: " + song);
      console.log("Artist(s): " + artist);
      console.log("Album: " + album);
      console.log("Preview URL: " + previewURL);
      console.log("-----------------------------------------");

      var date = new Date();

      // Variable that holds data in the log.txt file.
      var output =
        date + `: Fetched song '` + trackName + `' by ` + artists + ` from Spotify.\n` +
        `-----------------------------------------` + `\n`;

      // Calls function to append above variable to the log.txt file
      appendToFile(output);
    }
  });
}

var bandsMakeHerDance = function(artist) {
  var queryURL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=3eb1f1fc89e56c51188ca9a164a22b2d`;

  request(queryURL, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var jsonData = JSON.parse(body);

      if (!jsonData.length) {
        console.log("No shows for " + artist);
        return;
      }

      console.log("Upcoming shows for " + artist + ":");

      for (var i = 0; i < jsonData.length; i++) {
        var show = jsonData[i];

        // Log data for any concert
        console.log(
          show.venue.city +
            "," +
            (show.venue.region || show.venue.country) +
            " at " +
            show.venue.name +
            " " +
            moment(show.datetime).format("MM/DD/YYYY")
        );
      }
    }
  });
};



// Function to display movie info
function movieInfo(movieName) {
  // With no input, function will default
  if (!movieName) {
    movieName = "Ex+Machina";
  } else {
    movieName = movieName;
  }

  // Query URL with some sweet ES6
  var queryUrl = `http://www.omdbapi.com/?t=${movieName}&y=&plot=short&apikey=trilogy` + keys.omdb_key;

  // Make the request
  request(queryUrl, function(error, response, body) {
    // Log potential errors
    if (error) {
      console.log(error);
    } else if (!error && response.statusCode === 200) {

      // Else, store the response as variables
      var title = JSON.parse(body)["Title"];
      var yearReleased = JSON.parse(body)["Year"];
      var imdbRating = JSON.parse(body)["imdbRating"];
      var rottenTomatoesRating = JSON.parse(body)["Ratings"][1]["Value"];
      var country = JSON.parse(body)["Country"];
      var language = JSON.parse(body)["Language"];
      var plot = JSON.parse(body)["Plot"];
      var actors = JSON.parse(body)["Actors"];

      // Logs the movie data
      console.log("Title: " + title);
      console.log("Year Released: " + yearReleased);
      console.log("IMDb Rating: " + imdbRating);
      console.log("Rotten Tomatoes Rating: " + rottenTomatoesRating);
      console.log("Country: " + country);
      console.log("Language: " + language);
      console.log("Plot: " + plot);
      console.log("Actors: " + actors);
      console.log("-----------------------------------------");

      var date = new Date(); 

      // Sends info to .txt
      var output = 
        date + `: Fetched movie '` + title + `' from OMDb.\n` +
        `-----------------------------------------` + `\n`;

      // Appends .txt file
      appendToTxt(output);
    }
  });
}

// Function to react to users bad inputs
function followItYaDingus() {

  // Reads the data from a file called 'random.txt'
  fs.readFile("random.txt", "utf8", function(error, data) {
    // Log errors (if any)
    if (error) {
      console.log(error);
    } else {

      // Splits anything that may include a comma
      var splitInput = data.split(",");
      
      // Executes command
      var todo = splitInput[0];

      // Grabs query
      var queryString = splitInput[1];

      // Calls all respective functinos
      switch (todo) {
        case "spotify-this-song":
          spotifyThisSong(queryString);
          break;
          case "bands-in-town":
          bandsMakeHerDance(queryString);
          break;
        case "movie-this":
          movieInfo(queryString);
          break;
        default: 
          console.log("Try using the correct input ya dingus");
        }
    }
  }); 
}

// Function that appends variables to log.txt
function appendToTxt(output) {
  // Appends output to log.txt
  fs.appendFile("log.txt", output, function(error) {
    // Logs any errors
    if (error) {
      console.log(error);
    }
    else {

      console.log("Data added to the log file.");
    }
  });
}