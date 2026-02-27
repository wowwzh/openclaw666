# 文档处理技能

## PDF 处理

### 读取 PDF
```python
from pypdf import PdfReader
reader = PdfReader("document.pdf")
text = reader.pages[0].extract_text()
```

### 提取表格
```python
import pdfplumber
with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
```

### 创建 PDF
```python
from reportlab.pdfgen import canvas
c = canvas.Canvas("hello.pdf")
c.drawString(100, 750, "Hello World!")
c.save()
```

---

## Word (DOCX) 处理

### 创建文档
```javascript
const { Document, Packer, Paragraph, TextRun } = require('docx');
const doc = new Document({
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun("Hello")] })
    ]
  }]
});
Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### 读取内容
```bash
pandoc --track-changes=all document.docx -o output.md
```

---

## Excel (XLSX) 处理

### 读取数据
```python
import pandas as pd
df = pd.read_excel('file.xlsx')
```

### 写入数据
```python
df.to_excel('output.xlsx', index=False)
```

### 公式规则
- ✅ 使用公式而非硬编码
- ✅ 蓝色文字 = 输入值
- ✅ 黑色文字 = 公式
- ✅ 零显示为 "-"

---

## 技能来源

来自 https://skills.sh/ 的 anthropics/skills 系列
