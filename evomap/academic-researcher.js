/**
 * Academic Research Assistant
 * 学术研究助手
 * 功能：搜索论文、提取摘要、分析引用、生成文献综述
 */

class AcademicResearcher {
  constructor(options = {
    maxResults: 10,
    includeAbstract: true,
    timeout: 30000
  }) {
    this.maxResults = options.maxResults || 10;
    this.includeAbstract = options.includeAbstract !== false;
    this.timeout = options.timeout || 30000;
    
    // Semantic Scholar API 基础URL
    this.s2ApiBase = 'https://api.semanticscholar.org/graph/v1';
  }

  // 搜索论文
  async searchPapers(query, options = {}) {
    const limit = options.limit || this.maxResults;
    const fields = 'title,authors,year,abstract,citationCount,venue,openAccessPdf,url';
    
    const url = `${this.s2ApiBase}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return this.formatPapers(data.data || []);
    } catch (error) {
      console.error('Search error:', error.message);
      // 尝试备选方案
      return this.searchArxiv(query, limit);
    }
  }

  // 备用：搜索 arXiv
  async searchArXiv(query, limit = 5) {
    try {
      const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${limit}`;
      const response = await fetch(url);
      const text = await response.text();
      
      // 简单解析 XML
      const papers = [];
      const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      
      for (const entry of entries) {
        const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || '';
        const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim() || '';
        const author = entry.match(/<author><name>([\s\S]*?)<\/name>/)?.[1]?.trim() || '';
        const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.substring(0, 10) || '';
        
        papers.push({
          title,
          abstract: summary.substring(0, 500) + '...',
          authors: [{ name: author }],
          year: parseInt(published) || null,
          venue: 'arXiv',
          citationCount: 0,
          url: entry.match(/<id>([\s\S]*?)<\/id>/)?.[1] || ''
        });
      }
      
      return papers;
    } catch (error) {
      console.error('ArXiv search error:', error.message);
      return [];
    }
  }

  // 格式化论文数据
  formatPapers(papers) {
    return papers.map(paper => ({
      title: paper.title || 'Untitled',
      authors: paper.authors?.map(a => a.name).join(', ') || 'Unknown',
      year: paper.year || null,
      abstract: paper.abstract || 'No abstract available',
      citationCount: paper.citationCount || 0,
      venue: paper.venue || '',
      url: paper.url || paper.openAccessPdf?.url || ''
    }));
  }

  // 获取论文详情
  async getPaperDetail(paperId) {
    const fields = 'title,authors,year,abstract,citationCount,venue,references,citations';
    const url = `${this.s2ApiBase}/paper/${paperId}?fields=${fields}`;
    
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Paper detail error:', error.message);
      return null;
    }
  }

  // 生成文献综述
  generateLiteratureReview(papers) {
    if (!papers || papers.length === 0) {
      return '未找到相关论文';
    }

    const review = {
      summary: `找到 ${papers.length} 篇相关论文`,
      papers: papers.map((p, i) => ({
        number: i + 1,
        title: p.title,
        authors: p.authors,
        year: p.year,
        citations: p.citationCount,
        venue: p.venue
      })),
      insights: this.generateInsights(papers)
    };

    return review;
  }

  // 生成洞察
  generateInsights(papers) {
    const insights = [];
    
    // 按年份统计
    const years = papers.filter(p => p.year).map(p => p.year);
    if (years.length > 0) {
      const avgYear = Math.round(years.reduce((a, b) => a + b, 0) / years.length);
      insights.push(`平均发表年份: ${avgYear}`);
    }
    
    // 按引用排序
    const topCited = papers.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))[0];
    if (topCited) {
      insights.push(`最高引用: "${topCited.title.substring(0, 30)}..." (${topCited.citationCount} 次引用)`);
    }
    
    return insights;
  }

  // 主研究流程
  async research(topic, question = '') {
    console.log(`🔍 正在研究: ${topic}`);
    
    // 1. 搜索论文
    const query = question ? `${topic} ${question}` : topic;
    const papers = await this.searchPapers(query);
    
    // 2. 生成综述
    const review = this.generateLiteratureReview(papers);
    
    return {
      topic,
      query,
      paperCount: papers.length,
      papers: papers.slice(0, 5), // 返回前5篇
      review,
      timestamp: new Date().toISOString()
    };
  }
}

// 导出
module.exports = { AcademicResearcher };
