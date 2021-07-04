var fs = require('fs');
var data = fs.readFileSync('db/recipes.json');
var recipes = JSON.parse(data);
console.log(recipes);

var express = require('express');
var app = express();
const PORT = process.env.PORT || 3000;

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://shopping-gen.herokuapp.com/');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function(req, res) {     //main index page
    res.sendFile(__dirname + '/db/recipes.json');
});
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));


function addRecipe(recipe){
    recipes.push({name: recipe.name, ingredients: recipe.ingredients})
    fs.writeFile('recipes.json', JSON.stringify(recipes, null, 2), finished);       //adding 2 to stringify will format with 2 spaces. readability
}

function getRecipes(){
    return recipes;
}

function finished(){
    console.log(recipes);

}
