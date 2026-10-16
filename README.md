# Request-scoped one-sided `forwardRef`

A request-scoped one-sided `forwardRef` cycle hangs instead of throwing a `CircularDependencyException`.

Minimal reproduction for a `@nestjs/core` regression possibly introduced in 11.2.3 (nestjs/nest#17563).

We start with two request-scoped providers that depend on each other. Then, only `UpdateUsecase` uses `forwardRef`.

In `main.ts`, we resolve them in both orders, each using a fresh app instance.

```sh
npm ci
npm run repro           # use @nestjs/core 12.1.3
npm run repro:11.2.2    # last known version without the hang issue
npm run repro:11.2.3    # first known version with the hang issue
npm run repro:11.2.7    # latest v11.x.x version to date
npm ci                  # back to 12.1.3
```

| Version                | Create to Update                     | Update to Create                  |
| ---------------------- | ------------------------------------ | --------------------------------- |
| 11.2.2                 | throws `CircularDependencyException` | `ok (update.create is undefined)` |
| 11.2.3, 11.2.7, 12.1.3 | throws `CircularDependencyException` | `HANG: resolve() never settled`   |
