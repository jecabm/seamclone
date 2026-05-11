import mongoose, { Schema, Document } from 'mongoose';

export interface IScan extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rawImageUri: string;
  rectifiedImageUri?: string;
  referenceObject: {
    objectType: 'credit_card' | 'ruler' | 'custom';
    widthPx: number;
    heightPx: number;
    confidence: number;
    detected: boolean;
  };
  calibration: {
    ppm: number;
    realWorldWidthMm: number;
    pixelWidth: number;
  };
  validation: {
    tiltDeg: number;
    tiltOk: boolean;
    garmentEdgeDetected: boolean;
    scaleReferenceDetected: boolean;
    captureEnabled: boolean;
  };
  adjustmentParams?: {
    edgeRefinement: number;
    seamAllowance: number;
  };
  status: 'captured' | 'rectified' | 'processed';
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rawImageUri: { type: String, required: true, trim: true },
    rectifiedImageUri: { type: String, default: '' },
    referenceObject: {
      objectType: {
        type: String,
        enum: ['credit_card', 'ruler', 'custom'],
        required: true,
      },
      widthPx: { type: Number, required: true, min: 1 },
      heightPx: { type: Number, required: true, min: 1 },
      confidence: { type: Number, required: true, min: 0, max: 1 },
      detected: { type: Boolean, required: true },
    },
    calibration: {
      ppm: { type: Number, required: true, min: 0.01 },
      realWorldWidthMm: { type: Number, required: true, min: 1 },
      pixelWidth: { type: Number, required: true, min: 1 },
    },
    validation: {
      tiltDeg: { type: Number, required: true, min: 0 },
      tiltOk: { type: Boolean, required: true },
      garmentEdgeDetected: { type: Boolean, required: true },
      scaleReferenceDetected: { type: Boolean, required: true },
      captureEnabled: { type: Boolean, required: true },
    },
    adjustmentParams: {
      edgeRefinement: { type: Number, min: 0, max: 100, default: 50 },
      seamAllowance: { type: Number, min: 0, max: 100, default: 15 },
    },
    status: {
      type: String,
      enum: ['captured', 'rectified', 'processed'],
      default: 'captured',
    },
  },
  { timestamps: true }
);

export const Scan = mongoose.model<IScan>('Scan', ScanSchema);
