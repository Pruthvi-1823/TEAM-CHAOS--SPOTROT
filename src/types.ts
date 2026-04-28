/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Batch {
  id: string;
  title: string;
  type: string;
  origin: string;
  status: 'active' | 'completed' | 'spoiled';
  createdAt: any; // Firestore Timestamp
  createdBy: string;
}

export interface Scan {
  id: string;
  batchId: string;
  produceType?: string;
  location: string;
  locationType: string;
  imageUrl: string;
  spoilageScore: number; // 0-10
  predictedShelfLife: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  analysisNotes: string;
  reroutingDecision?: string;
  temperature?: number;
  humidity?: number;
  transitHours?: number;
  timestamp: any; // Firestore Timestamp
  scannedBy: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'Farm' | 'Warehouse' | 'Transport' | 'Market';
}
