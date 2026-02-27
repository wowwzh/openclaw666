/**
 * Local Vector Store - 本地语义搜索
 * 
 * 使用简单的向量相似度实现语义搜索
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加批量操作支持
 * - 添加错误处理和日志
 * - 添加配置选项
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/** @type {string} */
const DB_FILE = process.env.VECTOR_DB || 'D:/OpenClaw/workspace/skills/local-vector-store/vector-db.json';

/** @typedef {{text: string, vector: Object, metadata: Object, createdAt: string}} Document */

/**
 * @typedef {Object} VectorStoreConfig
 * @property {string} dbPath - 数据库路径
 * @property {number} defaultTopK - 默认返回数量
 */

/**
 * 简单的文本转向量 (基于词频)
 * @param {string} text - 输入文本
 * @returns {Object} 词频向量
 */
function textToVector(text) {
  const words = text.toLowerCase().match(/\w+/g) || [];
  const vector = {};
  
  for (const word of words) {
    vector[word] = (vector[word] || 0) + 1;
  }
  
  return vector;
}

/**
 * 余弦相似度计算
 */
function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (const key of keys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 添加文档到向量库
 */
function addDocument(id, text, metadata = {}) {
  const db = loadDB();
  
  db.documents[id] = {
    text,
    vector: textToVector(text),
    metadata,
    createdAt: new Date().toISOString()
  };
  
  saveDB(db);
  return id;
}

/**
 * 语义搜索
 */
function search(query, topK = 5) {
  const db = loadDB();
  const queryVector = textToVector(query);
  
  const results = Object.entries(db.documents)
    .map(([id, doc]) => ({
      id,
      text: doc.text,
      metadata: doc.metadata,
      score: cosineSimilarity(queryVector, doc.vector)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  return results;
}

/**
 * 删除文档
 * @param {string} id - 文档ID
 */
function deleteDocument(id) {
  const db = loadDB();
  delete db.documents[id];
  saveDB(db);
}

/**
 * 批量添加文档
 * @param {Array<{id?: string, text: string, metadata?: Object}>} docs - 文档数组
 * @returns {string[]} 添加的ID数组
 */
function addDocuments(docs) {
  const db = loadDB();
  const ids = [];
  
  for (const doc of docs) {
    const id = doc.id || generateId();
    db.documents[id] = {
      text: doc.text,
      vector: textToVector(doc.text),
      metadata: doc.metadata || {},
      createdAt: new Date().toISOString()
    };
    ids.push(id);
  }
  
  saveDB(db);
  return ids;
}

/**
 * 加载数据库
 */
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load vector DB:', e.message);
  }
  return { documents: {} };
}

/**
 * 保存数据库
 */
function saveDB(db) {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/**
 * 生成文档ID
 */
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

module.exports = {
  addDocument,
  search,
  deleteDocument,
  generateId,
  textToVector,
  cosineSimilarity
};
