# 自动文档生成技能

根据代码自动生成文档。

## API文档

```python
def generate_api_docs(functions: list) -> str:
    docs = "# API Documentation\n\n"
    
    for func in functions:
        docs += f"## {func.name}\n\n"
        docs += f"{func.docstring}\n\n"
        docs += "### Parameters\n\n"
        for param in func.parameters:
            docs += f"- `{param.name}` ({param.type}): {param.description}\n"
        docs += "\n"
    
    return docs
```

## JSDoc自动生成

```javascript
/**
 * @function calculateTotal
 * @param {number[]} prices - Array of prices
 * @param {number} tax - Tax rate (default 0.1)
 * @returns {number} Total price including tax
 */
function calculateTotal(prices, tax = 0.1) {
  return prices.reduce((sum, p) => sum + p) * (1 + tax);
}
```

## TypeDoc集成

```bash
# 安装
npm install -D typedoc

# 生成
npx typedoc src/index.ts --out docs
```

## 自动生成工具

| 工具 | 语言 | 特点 |
|------|------|------|
| JSDoc | JS/TS | 注释生成 |
| Sphinx | Python | reStructuredText |
| Docusaurus | MDX | React文档 |
| Swagger | OpenAPI | API文档 |

## GitHub README模板

```markdown
# Project Name

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`js
import { func } from 'package';
func();
\`\`\`

## API

| Function | Description |
|----------|-------------|
| func() | Does something |
```

## CI集成

```yaml
# .github/workflows/docs.yml
name: Docs
on: [push]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout
      - run: npm run docs
      - uses: peaceiris/actions-gh-pages@v3
```
