// Auth types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

// Project types
export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'draft' | 'scanning' | 'editing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  referenceScale?: ReferenceScale;
  thumbnail?: string;
}

// Reference scale calibration
export interface ReferenceScale {
  objectType: 'credit_card' | 'ruler' | 'custom';
  realWorldLength: number; // in mm
  pixelLength: number;
  scale: number; // pixels per mm
  timestamp: Date;
}

// New type for reference orientation
export type ReferenceOrientation = 'landscape' | 'portrait';

export interface ScanReferenceObject {
  objectType: 'credit_card' | 'ruler' | 'custom';
  widthPx: number;
  heightPx: number;
  confidence: number;
  detected: boolean;
  orientation: ReferenceOrientation;
  corners: Point[];
}

export interface ScanCalibration {
  ppm: number;
  realWorldWidthMm: number;
  pixelWidth: number;
  pixelHeight: number;
}

export interface ScanValidation {
  tiltDeg: number;
  tiltOk: boolean;
  garmentEdgeDetected: boolean;
  scaleReferenceDetected: boolean;
  captureEnabled: boolean;
}

// Scan data
export interface Scan {
  id: string;
  projectId: string;
  userId: string;
  rawImageUri: string;
  rectifiedImageUri?: string;
  referenceObject: ScanReferenceObject;
  calibration: ScanCalibration;
  validation: ScanValidation;
  adjustmentParams?: AdjustmentParams;
  status: 'captured' | 'rectified' | 'processed';
  createdAt: Date;
  updatedAt: Date;
}

// Adjustment parameters for edge detection and rectification
export interface AdjustmentParams {
  edgeRefinement: number; // 0-100 (threshold)
  seamAllowance: number; // in mm
  perspective?: PerspectiveParams;
}

// Perspective correction parameters
export interface PerspectiveParams {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

// Point in 2D space
export interface Point {
  x: number;
  y: number;
}

// Pattern piece
export interface PatternPiece {
  id: string;
  projectId: string;
  name: string;
  scanId: string;
  boundaries: Point[]; // polygon vertices
  width: number; // in mm
  height: number; // in mm
  area: number; // in mm²
  createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  MainApp: undefined;
  Library: undefined;
  NewScan: undefined;
  Settings: undefined;
  ProjectDetail: { projectId: string };
  ScanningInterface: { projectId: string };
  Rectification: { projectId: string; scanId: string };
  PatternPieces: { projectId: string };
  ExportSettings: { projectId: string };
};

// Export/PDF types
export interface ExportSettings {
  paperSize: 'A4' | 'Letter' | 'A0';
  removeEmptyMargins: boolean;
  overlap: number; // in mm (for tiling alignment)
  showCropMarks: boolean;
}

export interface PDFExportJob {
  id: string;
  projectId: string;
  pieces: PatternPiece[];
  settings: ExportSettings;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  createdAt: Date;
}
