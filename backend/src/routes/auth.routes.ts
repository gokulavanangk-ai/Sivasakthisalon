import { Router } from 'express';
import {
  loginHandler,
  logoutHandler,
  changePasswordHandler,
  updateProfileHandler,
  meHandler,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import {
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), loginHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticate, meHandler);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfileHandler);
router.put('/password', authenticate, validate(changePasswordSchema), changePasswordHandler);

export default router;