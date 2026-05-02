# 贡献指南

感谢你对本项目的关注！以下是参与开发的基本规范。

## 环境要求

- Node.js >= 22
- npm >= 10

## 本地启动

```bash
npm install
npm run dev
```

访问 http://localhost:3000。

## 分支规范

| 前缀 | 用途 |
|------|------|
| `feat/` | 新功能 |
| `fix/` | Bug 修复 |
| `docs/` | 文档更新 |
| `refactor/` | 重构 |
| `chore/` | 构建/工具/依赖更新 |

示例：`feat/add-monthly-report`

## Commit Message 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

常用 type：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

## 提交前检查

pre-commit hooks 会自动运行 `lint-staged`。你也可以手动检查：

```bash
npm run lint
npm run test
```

## PR 规范

1. 从 `main` 切出新分支
2. 确保 CI 通过（lint + build）
3. 提交 PR，等待合并
