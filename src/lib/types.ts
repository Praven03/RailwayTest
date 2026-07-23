export interface Part {
  id: string;
  description: string;
  qty: number;
}

export type ReportStatus = "draft" | "completed";

export interface ServiceReport {
  id: string;
  jobNo: string;
  refNo: string;
  date: string;

  clientName: string;
  userName: string;
  contactNo: string;

  equipment: string;
  brand: string;
  model: string;
  snCrNo: string;

  typeOfService: string[];
  othersText: string;

  jobScope: string;
  actionTaken: string;
  conclusion: string;

  parts: Part[];

  customerName: string;
  customerDate: string;
  customerSignature: string | null;

  technicianName: string;
  technicianDate: string;
  technicianSignature: string | null;

  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export const SERVICE_TYPES = [
  "Site Calibration",
  "Adhoc",
  "Mapping / Validation",
  "Plan Preventive Maintenance",
  "Contract Service",
  "Training",
  "Warranty",
] as const;
