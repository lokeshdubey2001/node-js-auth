const homeController = async(req, res) => {
    const {username, userId, role} = req.userInfo;
    res.json({
        message: 'Welcome to the Home page!',
        user: {
            _id: userId,
            username,
            role
        }
    })
}

module.exports = homeController;

