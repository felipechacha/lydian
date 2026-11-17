export interface Technique {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly category: string;
}

export interface TechniquesDataResponse {
  readonly data: readonly Technique[];
}

export interface ListTechniquesQuery {
  readonly category?: string;
  readonly search?: string;
}
