import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Dashboard route - implementation pending' });
});

export default router;
