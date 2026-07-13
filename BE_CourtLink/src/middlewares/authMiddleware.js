import jwt from 'jsonwebtoken'

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({status: 'fail', message: 'Not authorization'});
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({status: 'fail', message:'Token invalid'})
  }
};
export default protect;