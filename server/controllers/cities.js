const cities = require('../models').cities;

module.exports = {
    search(req, res) {
        if(!req.body || !req.body.name) return res.sendStatus(400);
        //Trim and escape the name field.
        req.sanitize('name').escape();
        req.sanitize('name').trim();

        //Run the validators
        const errors = req.validationErrors();

        //Create a city object with escaped and trimmed data.
        const city = { name: req.body.name };


        if (errors) {
            res.sendStatus(400);
            return;
        }
        else {
            // Data post is valid.
            return cities
                .findAll({
                    raw: true,
                    attributes: ['city_name'],
                    where: {
                        city_name: {
                            $iLike: '%' + city.name + '%'
                        }
                    },
                    limit: 5
                })
                .then(data => {
                    res.json(data)
                })
                .catch(error => res.status(400).send('Sorry, We are coming soon'));
        }

    },
};
