import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc hết hạn' });
  }
}

export default authMiddleware;
