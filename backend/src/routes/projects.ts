import { Router, Response } from 'express';
import { Project } from '../models/Project';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// GET /api/projects — get all projects for current user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(
      projects.map((p) => ({
        id: p._id.toString(),
        userId: p.userId.toString(),
        title: p.title,
        description: p.description,
        status: p.status,
        thumbnail: p.thumbnail,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
    );
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/:id — get single project
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    res.json({
      id: project._id.toString(),
      userId: project.userId.toString(),
      title: project.title,
      description: project.description,
      status: project.status,
      thumbnail: project.thumbnail,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects — create a project
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, status } = req.body;

  if (!title) {
    res.status(400).json({ message: 'Title is required' });
    return;
  }

  try {
    const project = await Project.create({
      userId: req.userId,
      title,
      description: description || '',
      status: status || 'draft',
    });
    res.status(201).json({
      id: project._id.toString(),
      userId: project.userId.toString(),
      title: project.title,
      description: project.description,
      status: project.status,
      thumbnail: project.thumbnail,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/projects/:id — update a project
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, status, thumbnail } = req.body;

  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...(title && { title }), ...(description !== undefined && { description }), ...(status && { status }), ...(thumbnail !== undefined && { thumbnail }) },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({
      id: project._id.toString(),
      userId: project.userId.toString(),
      title: project.title,
      description: project.description,
      status: project.status,
      thumbnail: project.thumbnail,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id — delete a project
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
