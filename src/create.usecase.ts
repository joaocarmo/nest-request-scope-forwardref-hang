import { Injectable, Scope } from '@nestjs/common';
import { UpdateUsecase } from './update.usecase';

@Injectable({ scope: Scope.REQUEST })
export class CreateUsecase {
  constructor(public readonly update: UpdateUsecase) {}
}
