const jwt = require('jsonwebtoken');

const signJwt = (idUser, email, role) => {
  return jwt.sign({ email, role }, process.env.JWTSECRET, { expiresIn: '7d', subject: idUser });
};

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWTSECRET);
}

module.exports = {
  signJwt,
  verifyJwt
}