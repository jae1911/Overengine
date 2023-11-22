export interface weatherResponse {
  readonly description: string;
}

export interface weatherMain {
  readonly temp: number;
}

export interface weatherGenericResponse {
  readonly weather: readonly weatherResponse[];
  readonly main: weatherMain | null;
}
