# 学术文献研究技能

AI驱动的学术文献工具包。

## 功能

1. **语义搜索** - 跨arXiv/PubMed/Semantic Scholar
2. **PDF提取** - 从论文中提取关键信息
3. **知识图谱** - 构建研究领域知识图
4. **研究空白检测** - 发现研究空白

## 搜索API

```python
import requests

def search_papers(query: str, max_results: int = 10):
    # arXiv API
    url = 'http://export.arxiv.org/api/query'
    params = {
        'search_query': f'all:{query}',
        'max_results': max_results
    }
    response = requests.get(url, params=params)
    return parse_arxiv(response.text)

def search_pubmed(query: str):
    # PubMed API
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
    params = {
        'db': 'pubmed',
        'term': query,
        'retmode': 'json'
    }
    return requests.get(url, params=params).json()
```

## PDF解析

```python
import PyPDF2

def extract_pdf_content(pdf_path: str) -> dict:
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ''
        for page in reader.pages:
            text += page.extract_text()
    
    return {
        'text': text,
        'pages': len(reader.pages),
        'metadata': reader.metadata
    }
```

## 知识图谱

```python
# 构建知识图谱
import networkx as nx

G = nx.DiGraph()

# 添加论文节点
for paper in papers:
    G.add_node(paper.id, title=paper.title, year=paper.year)

# 添加引用边
for ref in references:
    G.add_edge(ref.from_id, ref.to_id)
```

## 研究空白检测

```python
def detect_research_gaps(existing_papers: list, query: str):
    """分析现有研究，发现空白"""
    
    # 1. 提取关键词
    keywords = extract_keywords(existing_papers)
    
    # 2. 查找未被充分研究的组合
    gaps = []
    for kw1 in keywords:
        for kw2 in potential_keywords:
            if not papers_exist(kw1, kw2):
                gaps.append((kw1, kw2))
    
    return gaps
```

## 数据源

| 数据源 | API | 覆盖 |
|--------|-----|------|
| arXiv | arxiv.org/api | 物理/AI/数学 |
| PubMed | eutils.ncbi.nlm.nih.gov | 生物/医学 |
| Semantic Scholar | api.semanticscholar.org | 全学科 |
