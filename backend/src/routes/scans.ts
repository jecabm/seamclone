import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import { Scan } from '../models/Scan';

const router = Router();

router.use(authenticate);

const toScanResponse = (scan: any) => ({
  id: scan._id.toString(),
  projectId: scan.projectId.toString(),
  userId: scan.userId.toString(),
  rawImageUri: scan.rawImageUri,
  rectifiedImageUri: scan.rectifiedImageUri,
  referenceObject: scan.referenceObject,
  calibration: scan.calibration,
  validation: scan.validation,
  adjustmentParams: scan.adjustmentParams,
  status: scan.status,
  createdAt: scan.createdAt,
  updatedAt: scan.updatedAt,
});

// POST /api/scans
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    projectId,
    rawImageUri,
    referenceObject,
    calibration,
    validation,
  } = req.body;

  if (!projectId || !rawImageUri || !referenceObject || !calibration || !validation) {
    res.status(400).json({ message: 'Missing required scan fields' });
    return;
  }

  if (!validation.captureEnabled) {
    res.status(400).json({
      message: 'Capture validation failed: garment edge, scale reference, and tilt constraints are required',
    });
    return;
  }

  try {
    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const scan = await Scan.create({
      projectId,
      userId: req.userId,
      rawImageUri,
      referenceObject,
      calibration,
      validation,
    });

    res.status(201).json(toScanResponse(scan));
  } catch (err) {
    console.error('Create scan error:', err);
    res.status(500).json({ message: 'Server error creating scan' });
  }
});

// GET /api/scans/project/:projectId
router.get('/project/:projectId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scans = await Scan.find({ projectId: req.params.projectId, userId: req.userId }).sort({ createdAt: -1 });
    res.json(scans.map(toScanResponse));
  } catch (err) {
    console.error('List scans error:', err);
    res.status(500).json({ message: 'Server error listing scans' });
  }
});

// GET /api/scans/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, userId: req.userId });
    if (!scan) {
      res.status(404).json({ message: 'Scan not found' });
      return;
    }

    res.json(toScanResponse(scan));
  } catch (err) {
    console.error('Get scan error:', err);
    res.status(500).json({ message: 'Server error getting scan' });
  }
});

export default router;
