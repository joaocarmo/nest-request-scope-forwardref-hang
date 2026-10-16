import "reflect-metadata";
import { Module, Type } from "@nestjs/common";
import { ContextIdFactory, NestFactory } from "@nestjs/core";
import { CreateUsecase } from "./create.usecase";
import { UpdateUsecase } from "./update.usecase";

const TIMEOUT_MS = 5_000;

@Module({ providers: [CreateUsecase, UpdateUsecase] })
class AppModule {}

/**
 * Resolves each provider in its own request using a fresh app and reports back.
 */
const run = async (label: string, orderedProviders: Type[]) => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const resolveAll = async () => {
    let instance: unknown;

    for (const provider of orderedProviders) {
      instance = await app.resolve(provider, ContextIdFactory.create());
    }

    return instance instanceof CreateUsecase
      ? `ok (update.create is ${typeof instance.update.create})`
      : "ok";
  };

  const timeout = new Promise<string>((resolve) =>
    setTimeout(() => resolve("HANG: resolve() never settled"), TIMEOUT_MS),
  );

  const outcome = await Promise.race([
    resolveAll().catch(
      (err: unknown) =>
        `ERROR: ${err instanceof Error ? err.constructor.name : String(err)}`,
    ),
    timeout,
  ]);

  console.log(`${label}: ${outcome}`);
};

const main = async () => {
  // This throws CircularDependencyException since 11.1.20.
  await run("Create -> Update", [CreateUsecase, UpdateUsecase]);

  // This hangs since 11.2.3.
  // However, up to 11.2.2, it returned, but with `update.create === undefined`.
  await run("Update -> Create", [UpdateUsecase, CreateUsecase]);

  process.exit(0);
};

main();
