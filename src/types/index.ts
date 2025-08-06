export type AbgValues = {
  ph: string; paco2: string; hco3: string; pao2: string;
  fio2: string; na: string; cl: string;
};

export type PatientDetails = {
  name: string; age: string; mrn: string; hospital: string;
};

export type PressureUnit = 'mmHg' | 'kPa';

export type Interpretation = {
  acidBaseStatus: string; primaryDisorder: string; compensation: string; summary: string;
  compensationAnalysis: {
    title: string; expected: string; actual: string; interpretation: string;
  } | null;
};