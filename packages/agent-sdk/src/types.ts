export interface PassedContext {
  context?: string;
  previousHistory?: string;
  history?: HistoryStep[];
}

export interface HistoryStep {
  thought?: string;

  isQuestion?: boolean;
  action?: string;
  actionInput?: string;
  observation?: string;
  userMessage?: string;
  completed?: boolean;
  success?: boolean;
}

export interface ExecutionState {
  query: string;
  context?: string;
  previousHistory?: string;
  history: HistoryStep[];
  completed: boolean;
  autoMode: boolean;
  finalAnswer?: string;
}
