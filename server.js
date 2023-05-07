const express = require('express');
const cors = require('cors');
const server = express();
server.use(cors())
require('dotenv').config();
const pg = require('pg');

server.post('/Movies',addMovie);
server.use(cors())   // Middleware function 
const axios = require('axios');
const apiKey = process.env.apiKey;
const client = new pg.Client('postgresql://localhost:5432/test1')
server.use(express.json());

server.get('/trending', trending)
server.get('/GetMovies', MoviesHandler)
server.get('/search', search)


const jsonData = require('./MovieData/data.json');

server.get('/', (req, res) => {
  let movie = new Movie(jsonData.title, jsonData.poster_path, jsonData.overview)

  res.json(movie)
})


async function trending(req, res) {
  const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`;

  axios.get(url)
    .then(response => {
      const movieResults = response.data.results;

      const mapResult = movieResults.map(item => {
        const movieData = {
          id: item.id,
          title: item.title,
          release_date: item.release_date,
          overview: item.overview
        };
        return movieData;
      });

      res.send(mapResult);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send("Error retrieving trending movies.");
    });
}

function MoviesHandler(req, res) {

  const sql = `SELECT * FROM Movies;`
  client.query(sql)
    .then(data => {

      res.send(data.rows);

    }


    )
}


function addMovie(req,res){

const movie = req.body;
const sql = `INSERT INTO Movies (name,date)
VALUES($1,$2,$3);`
const values = [movie.name,movie.date];
client.query(sql,values)
.then(data => {
res.send("data been recorded succesfully")

})
}


async function search(req, res) {
  const searchTerm = req.query.term;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchTerm}`;

  try {
    const axiosResult = await axios.get(url);
    const searchResults = axiosResult.data.results.map((item) => {
      const movie = new Movie(item.title, item.poster_path, item.overview);
      return movie;
    });

    res.send(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}


//      let axiosResult = await axios.get(url);
//     console.log(axiosResult.jsonData.movie)
//     res.send(axiosResult.jsonData.movie)

//    let mapResult = axiosResult.jsonData.movie.map(item=>{
//         let singleRecipe = new TrendingMovie(item.id,item.title,item.release_date,item.poster_path,item.overview);
//         return singleRecipe;
//     })
//     res.send(mapResult)






function TrendingMovie(id, title, release_date, poster_path, overview) {
  this.id = id;
  this.title = title;
  this.release_date = release_date;
  this.poster_path = poster_path;
  this.overview = overview;
}



function Movie(title, poster_path, overview) {

  this.title = title;
  this.poster_path = poster_path;
  this.overview = overview;

};

server.get('/favorite', (req, res) => {
  res.send('Welcome to Favorite Page');
});

server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

server.use((req, res) => {
  res.status(404).send('Page Not Found');
});

client.connect()
  .then(() => {
    PORT = 3000;
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    })
  })
