import 'reflect-metadata';
import { Module, Type } from '@nestjs/common';
import { ContextIdFactory, NestFactory } from '@nestjs/core';
import { CreateUsecase } from './create.usecase';
import { UpdateUsecase } from './update.usecase';

@Module({ providers: [CreateUsecase, UpdateUsecase] })
class AppModule {}

const TIMEOUT_MS = 5000;

// Resolves each provider in its own request, on a fresh app, and reports how it ended.
async function run(label: string, order: Type[]) {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const resolveAll = async () => {
    let instance: unknown;
    for (const provider of order) {
      instance = await app.resolve(provider, ContextIdFactory.create());
    }
    return instance instanceof CreateUsecase
      ? `ok (update.create is ${typeof instance.update.create})`
      : 'ok';
  };
  const timeout = new Promise<string>(resolve =>
    setTimeout(() => resolve('HANG: resolve() never settled'), TIMEOUT_MS),
  );
  const outcome = await Promise.race([
    resolveAll().catch(err => `throws ${err.constructor.name}`),
    timeout,
  ]);
  console.log(`${label}: ${outcome}`);
}

async function main() {
  // Throws CircularDependencyException since 11.1.20.
  await run('Create -> Update', [CreateUsecase, UpdateUsecase]);
  // Hangs forever since 11.2.3. Up to 11.2.2 it returned, but with update.create === undefined.
  await run('Update -> Create', [UpdateUsecase, CreateUsecase]);
  process.exit(0);
}

main();
