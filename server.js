const express = require('express');
const cors = require('cors');
const server = express();
server.use(cors())
require('dotenv').config();
const pg = require('pg');

server.use(cors())   // Middleware function 
const axios = require('axios');
const apiKey = process.env.apiKey;
const client = new pg.Client('postgresql://localhost:5432/test1')
server.use(express.json());

server.get('/trending', trending)
server.get('/GetMovies', MoviesHandler)
server.get('/genre', genreCategory);
server.get('/popular', popularCategory);
server.post('/AddNewMovie',addMovie);
server.delete('/Movies/delete/:id',DeleteMovieHandler);
server.get('/search', search)
server.put('/Movies/update/:id',updateMovieHandler);

const jsonData = require('./MovieData/data.json');

server.get('/', (req, res) => {
  let movie = new Movie(jsonData.title, jsonData.poster_path, jsonData.overview)

  res.json(movie)
})



function DeleteMovieHandler(req,res)
{

  const id = req.params.id;
  const sql = `DELETE FROM Movies WHERE id=${id};`
  client.query(sql)
  .then((data)=>{
      res.status(202).send(data)
  })
  .catch((error)=>{
      errorHandler(error,req,res)
  })

}


function updateMovieHandler(req,res){

  const {id} = req.params;
  console.log(req.body);
  const sql = `UPDATE Movies
  SET title = $1
  WHERE id = ${id};`
  const {title} = req.body;
  const values = [title];
  client.query(sql,values).then((data)=>{
      res.send(data)
  })
  .catch((error)=>{
      errorHandler(error,req,res)
  })

}



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
  console.log(req.body);
  const sql = `INSERT INTO Movies (title,release_date,poster_path,overview) VALUES ($1,$2,$3,$4)`;
  const values = [movie.title, movie.release_date,movie.poster_path,movie.overview];
  client.query(sql,values)
  .then(data => {
    res.send("data has been recorded successfully");
  })
  .catch(error => {
    console.error(error);
    res.status(500).send("Internal server error");
  });
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


function genreCategory(req, res) {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;
  try {
      axios.get(url)
          .then(result => {
              let mapResult = result.data.genres.map(item => {
                  let singleresult = new Genre(item.id, item.name);
                  return (singleresult);
              })
              res.send(mapResult);
          })
          .catch((error) => {
              console.log('an error been occured ', error)
              res.status(500).send(error);
          })
  }
  catch (error) {
      errorHandler(error, req, res)
  }
}

function popularCategory(req, res) {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
  try {
      axios.get(url)
          .then(result => {
              let mapResult = result.data.results.map(item => {
                  let singleresult = new Movie( item.title,  item.poster_path, item.overview);
                  return (singleresult);
              })
              res.send(mapResult);
          })
          .catch((error) => {
              console.log('an error been occured', error)
              res.status(500).send(error);
          })
  }
  catch (error) {
      errorHandler(error, req, res)
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


function Genre(id, name) {
  this.id = id;
  this.name = name;
}



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
