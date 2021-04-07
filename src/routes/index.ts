import { Router } from 'express'
import { getTodosRoutes } from './todos'

export const getRoutes = () => {
  const router = Router()
  router.use('/todos', getTodosRoutes())
  return router
}
