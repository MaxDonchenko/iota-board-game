import { basicLinePlacement } from './BasicLinePlacement';
import { lotCreation } from './LotCreation';
import { multipleLots } from './MultipleLots';
import { wildCardPlacement } from './WildCardPlacement';
import { wildCardRecycling } from './WildCardRecycling';
import { multiLineScoring } from './MultiLineScoring';
import { allFourCards } from './AllFourCards';
import { finalTurn } from './FinalTurn';
import { complexGrid } from './ComplexGrid';
import { impossiblePlacement } from './ImpossiblePlacement';
import { edgeCaseValidation } from './EdgeCaseValidation';
import type { UseCase } from './types';

export type UseCaseName =
  | 'BasicLinePlacement'
  | 'LotCreation'
  | 'MultipleLots'
  | 'WildCardPlacement'
  | 'WildCardRecycling'
  | 'MultiLineScoring'
  | 'AllFourCards'
  | 'FinalTurn'
  | 'ComplexGrid'
  | 'ImpossiblePlacement'
  | 'EdgeCaseValidation';

export type { UseCase };

export const useCases: Record<UseCaseName, UseCase> = {
  BasicLinePlacement: basicLinePlacement,
  LotCreation: lotCreation,
  MultipleLots: multipleLots,
  WildCardPlacement: wildCardPlacement,
  WildCardRecycling: wildCardRecycling,
  MultiLineScoring: multiLineScoring,
  AllFourCards: allFourCards,
  FinalTurn: finalTurn,
  ComplexGrid: complexGrid,
  ImpossiblePlacement: impossiblePlacement,
  EdgeCaseValidation: edgeCaseValidation,
};
