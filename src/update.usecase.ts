import { Inject, Injectable, Scope, forwardRef } from "@nestjs/common";
import { CreateUsecase } from "./create.usecase";

@Injectable({ scope: Scope.REQUEST })
export class UpdateUsecase {
  constructor(
    @Inject(forwardRef(() => CreateUsecase))
    public readonly create: CreateUsecase,
  ) {}
}
