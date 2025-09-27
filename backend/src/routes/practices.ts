import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Practices route - implementation pending' });
});

export default router;
