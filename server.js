const express = require('express');
const app = express();

const jsonData = require('./MovieData/data.json');

app.get('/', (req, res) => {
    const formattedData = jsonData.map(movie => ({
        title: movie.Title,
        poster_path: movie.poster_path,
        overview: movie.overview
    }));

    res.json(formattedData);
});

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
