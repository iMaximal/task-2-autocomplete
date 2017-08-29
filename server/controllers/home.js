module.exports = {
    get(req, res) {
        res.render('home', {
            layout: false,
            csrfToken: req.csrfToken()
        })
    },
};
