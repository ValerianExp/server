const { verifyJwt } = require('../utils/jwt.util');
const deleteBearer = require('../utils/string.util');

const validateToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = deleteBearer(authorization);
    const { sub, email, role } = verifyJwt(token);
    req.user = { _id: sub, email, role };
  } else {
    console.log('401 middleware')
    res.status(401).json('No authorize');
    return;
  }

  next();
}

module.exports = validateToken;

