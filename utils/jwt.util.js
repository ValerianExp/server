const jwt = require('jsonwebtoken');

// NO SE OS OCURRA PONER ESTO AQUI, VA EN EL .ENV BURR@S
const signJwt = (idUser, email) => {
  return jwt.sign({ email }, process.env.JWTSECRET, { expiresIn: '7d', subject: idUser });
};

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWTSECRET);
}

module.exports = {
  signJwt,
  verifyJwt
}