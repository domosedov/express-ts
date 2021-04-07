import { Router } from 'express'

export const getTodosRoutes = () => {
  const router = Router()
  router.get('/', async (req, res) => {
    res.json({ todos: [] })
  })
  return router
}
