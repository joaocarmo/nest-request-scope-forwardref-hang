# Request-scoped one-sided forwardRef cycle hangs instead of throwing

Minimal reproduction for a `@nestjs/core` regression introduced in 11.2.3 (#17563).

Two request-scoped providers depend on each other. Only `UpdateUsecase` uses `forwardRef`.
`main.ts` resolves them in both orders, each order on a fresh app context.

```sh
npm ci
npm run repro           # @nestjs/core 12.1.3
npm run repro:11.2.2    # last version without the hang
npm run repro:11.2.3    # first version with the hang
npm run repro:11.2.7
npm ci                  # back to 12.1.3 after a versioned run
```

| Version                | Create -> Update                     | Update -> Create                  |
| ---------------------- | ------------------------------------ | --------------------------------- |
| 11.2.2                 | throws `CircularDependencyException` | `ok (update.create is undefined)` |
| 11.2.3, 11.2.7, 12.1.3 | throws `CircularDependencyException` | **HANG: resolve() never settled** |
