const express = require('express');
const app = express();

const jsonData = require('./MovieData/data.json');

app.get('/', (req, res) => {
    let  movie = new Movie(jsonData.title,jsonData.poster_path,jsonData.overview)

    res.json(movie)
})


function Movie(title,poster_path,overview){

this.title=title;
this.poster_path=poster_path;
this.overview=overview;

};

app.get('/favorite', (req, res) => {
    res.send('Welcome to Favorite Page');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
});

app.use((req, res) => {
    res.status(404).send('Page Not Found');
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
