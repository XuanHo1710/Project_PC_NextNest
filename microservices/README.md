# Project PC - Microservices

Monorepo architecture với Turborepo, NestJS microservices và shared packages.

## 📁 Cấu Trúc

```
microservices/
├── apps/
│   ├── api-gateway/      # API Gateway (public endpoints)
│   ├── auth-service/     # Authentication service
│   └── product-service/  # Product management service
├── packages/
│   ├── common/          # ✅ Shared DTOs & utilities
│   ├── eslint-config/   # Shared ESLint config
│   ├── typescript-config/ # Shared TS config
│   └── ui/              # Shared UI components
└── turbo.json           # Turborepo configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Common Package (Required First!)

```bash
# Linux/Mac
npm run build --workspace=@project-pc/common

# Hoặc dùng script
./build-common.sh      # Linux/Mac
build-common.bat       # Windows
```

### 3. Start All Services

```bash
npm run start:dev
```

## 📦 Shared DTOs (@project-pc/common)

### Import trong bất kỳ service nào:

```typescript
import {
  LoginDto,
  RefreshTokenDto,
  CreateAccountGuestDto,
  TokenResponseDto,
} from "@project-pc/common";
```

### Xem thêm:

- 📖 [Usage Guide](./USAGE_GUIDE.ts) - Chi tiết cách sử dụng
- ✅ [Fix Summary](./FIX_SUMMARY.md) - Log những gì đã fix
- 📚 [Common Package README](./packages/common/README.md)

## 🛠️ Development

### Start services riêng lẻ:

```bash
# API Gateway
cd apps/api-gateway && npm run start:dev

# Auth Service
cd apps/auth-service && npm run start:dev

# Product Service
cd apps/product-service && npm run start:dev
```

### Build all:

```bash
npm run build
```

### Lint:

```bash
npm run lint
```

## ⚠️ Important Notes

1. **Common package MUST be built first** trước khi start services
2. Mỗi khi thêm DTO mới vào common, phải rebuild: `npm run build -w @project-pc/common`
3. Services tự động restart khi có thay đổi (watch mode)
4. Turbo caching giúp build nhanh hơn

## 🎯 Available DTOs

- ✅ `LoginDto` - Email & password login
- ✅ `RefreshTokenDto` - Token refresh
- ✅ `TokenResponseDto` - Auth response
- ✅ `LogoutDto` - Logout with optional token
- ✅ `CreateAccountGuestDto` - Guest account creation

## 📝 Thêm DTO Mới

1. Tạo trong `packages/common/src/dto/[module]/`
2. Export trong `packages/common/src/dto/index.ts`
3. Build: `npm run build -w @project-pc/common`
4. Import ở service: `import { YourDto } from '@project-pc/common'`

## 🔧 Tech Stack

- **Monorepo**: Turborepo
- **Framework**: NestJS
- **Language**: TypeScript
- **Validation**: class-validator
- **Communication**: Microservices pattern với message queues

---

**📖 Need help?** Xem [USAGE_GUIDE.ts](./USAGE_GUIDE.ts) hoặc [FIX_SUMMARY.md](./FIX_SUMMARY.md)!

## CI build dependency contract

Every service importing `@project-pc/common` must declare
`"@project-pc/common": "^0.0.1"` in its production dependencies and keep
`package-lock.json` synchronized. Turbo uses these declarations with
`dependsOn: ["^build"]` to build common before its consumers. A workspace
symlink alone does not guarantee build ordering; a fresh CI runner can fail
with TS2307 while a developer machine with existing `common/dist` succeeds.

The Quality job runs these commands from `microservices/`:

```sh
npm ci --no-audit --no-fund
npm run test:build-contract
npm run build
```

The regression check inspects source imports, manifests, lockfile entries and
Turbo's actual dry-run task graph for each consuming app. It requires installed
dependencies but does not start services or connect to external infrastructure.
For direct service builds outside Turbo, build common first with
`npm run build --workspace=@project-pc/common`.

Validation of the CI dependency fix (Windows, Node 22.20.0, npm 11.7.0):
- Before the fix: 3 build-contract checks passed, 8 failed for missing dependencies.
- After the fix: all 11 checks passed; `npm ci --no-audit --no-fund` succeeded.
- `npm run build -- --force` passed all 12 build tasks with no cache hits,
  after removing the generated `packages/common/dist` directory.
- Prettier checks for the changed configuration/test files and workflow YAML
  parsing passed. The Ubuntu/Node 20 GitHub run and client typecheck were not
  executed locally; no deployment was performed.

## AI image: CPU dependencies and CI disk usage

The AI deployment in `docker-compose.yml` has no GPU reservation. Its Dockerfile
uses the official PyTorch CPU index for Torch, then PyPI for the application
requirements. `apps/ai-service/constraints-cpu.txt` pins `torch==2.14.0+cpu`
(the CPU variant of the version in the failing CI log) during both installs so
Sentence Transformers cannot replace it with a CUDA build. `xgboost-cpu`
provides the existing `xgboost` imports without pulling NVIDIA NCCL.
Other application dependency ranges are unchanged.

The image installs binary wheels and `libgomp1` for native OpenMP support,
instead of retaining `build-essential`. Every image build runs `pip check` and
`verify_cpu_runtime.py`: it rejects CUDA/NVIDIA/Triton distributions, imports
the ML libraries and performs a CPU tensor operation. It never loads application
modules, model weights, databases or AI providers. Changing Torch requires
updating the CPU constraint and repeating these checks.

Build locally without publishing:

```sh
docker build --progress=plain -t project-pc-ai:verify apps/ai-service
docker run --rm --network none --entrypoint python project-pc-ai:verify verify_cpu_runtime.py
```

The workflow runs AI in the separate `docker-ai` job on a fresh hosted runner;
it does not share disk with the 12 frontend/NestJS image builds. Deployment
requires both `docker` and `docker-ai` to succeed after Quality passes.

Actions now use Node 24-compatible releases: checkout v5, setup-node v5,
Docker login v4 and build-push v7. The self-hosted deployment runner must be
v2.327.1 or newer. The Node version installed for application builds is a
separate setting; it remains 20 to match the current Node Docker images.
Do not enable `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION` to bypass warnings.

References: [PyTorch CPU installation](https://pytorch.org/get-started/locally/),
[XGBoost CPU package](https://xgboost.readthedocs.io/en/stable/install.html),
[Docker Actions Node 24 migration](https://github.com/docker/build-push-action/releases/tag/v7.0.0).

Validation of this AI build fix:

- Linux x86_64/Python 3.11 wheel-only resolution passed for both the standalone
  Torch CPU install and the full application set (69 packages, no NVIDIA/CUDA/Triton).
- Both pip installation steps passed in an isolated Windows/Python 3.11
  environment. `pip check` and the offline runtime smoke check passed with
  Torch 2.14.0+cpu, Sentence Transformers 6.0.1, XGBoost CPU 3.2.0 and LightGBM 4.7.0.
- Four injected GPU/full-XGBoost dependency fixtures were rejected by the guard.
- Workflow YAML, its 13 image builds, dependency gates, action versions,
  Prettier formatting and `git diff --check` passed.
- A Linux Docker build was not executed because the local Docker daemon was
  unavailable. Model predictions and external integrations were not tested.
  No image was pushed and no deployment was triggered.
