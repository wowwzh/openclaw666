/**
 * 文件上传系统
 * File Upload System
 * 
 * 特性：
 * - 分片上传
 * - 进度追踪
 * - 断点续传
 * - 格式验证
 * 
 * 信号: file_upload, chunked_upload, resumable
 */

class FileUploader {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 1024 * 1024; // 1MB
    this.maxFileSize = options.maxFileSize || 100 * 1024 * 1024; // 100MB
    this.allowedTypes = options.allowedTypes || ['image/*', 'video/*', 'application/pdf'];
    this.uploadUrl = options.uploadUrl || '/api/upload';
    this.uploading = new Map();
  }

  /**
   * 上传文件
   */
  async upload(file, options = {}) {
    const { onProgress, resumable = true } = options;
    
    // 验证文件
    this.validateFile(file);
    
    // 分片
    const chunks = this.createChunks(file);
    const totalChunks = chunks.length;
    
    // 创建上传记录
    const uploadId = this.generateId();
    this.uploading.set(uploadId, {
      file,
      totalChunks,
      uploadedChunks: 0,
      startTime: Date.now()
    });

    try {
      // 逐片上传
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkInfo = {
          uploadId,
          chunkIndex: i,
          totalChunks,
          isLast: i === chunks.length - 1
        };

        await this.uploadChunk(chunk, chunkInfo);
        
        // 更新进度
        const progress = ((i + 1) / totalChunks) * 100;
        this.uploading.get(uploadId).uploadedChunks = i + 1;
        
        if (onProgress) {
          onProgress({
            uploadId,
            progress,
            uploaded: (i + 1) * this.chunkSize,
            total: file.size
          });
        }
      }

      // 合并文件
      const result = await this.mergeChunks(uploadId, file.name);
      this.uploading.delete(uploadId);
      
      return result;
      
    } catch (error) {
      // 清理
      this.uploading.delete(uploadId);
      throw error;
    }
  }

  /**
   * 验证文件
   */
  validateFile(file) {
    if (file.size > this.maxFileSize) {
      throw new Error(`File too large. Max size: ${this.maxFileSize}`);
    }
    
    const typeMatch = this.allowedTypes.some(type => {
      if (type.includes('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
    
    if (!typeMatch && this.allowedTypes.length > 0) {
      throw new Error(`File type not allowed: ${file.type}`);
    }
  }

  /**
   * 创建分片
   */
  createChunks(file) {
    const chunks = [];
    let offset = 0;
    
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + this.chunkSize);
      chunks.push(chunk);
      offset += this.chunkSize;
    }
    
    return chunks;
  }

  /**
   * 上传分片
   */
  async uploadChunk(chunk, chunkInfo) {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', chunkInfo.uploadId);
    formData.append('chunkIndex', chunkInfo.chunkIndex);
    formData.append('totalChunks', chunkInfo.totalChunks);
    formData.append('isLast', chunkInfo.isLast);

    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 合并分片
   */
  async mergeChunks(uploadId, filename) {
    const response = await fetch(`${this.uploadUrl}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, filename })
    });

    if (!response.ok) {
      throw new Error(`Merge failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 断点续传
   */
  async resumeUpload(uploadId) {
    const record = this.uploading.get(uploadId);
    if (!record) {
      throw new Error('Upload not found');
    }

    // 获取已上传的分片
    const response = await fetch(`${this.uploadUrl}/status/${uploadId}`);
    const status = await response.json();

    return {
      ...status,
      uploadId
    };
  }

  /**
   * 取消上传
   */
  async cancelUpload(uploadId) {
    await fetch(`${this.uploadUrl}/cancel/${uploadId}`, {
      method: 'DELETE'
    });
    this.uploading.delete(uploadId);
  }

  /**
   * 获取上传进度
   */
  getProgress(uploadId) {
    const record = this.uploading.get(uploadId);
    if (!record) return null;
    
    return {
      progress: (record.uploadedChunks / record.totalChunks) * 100,
      uploaded: record.uploadedChunks,
      total: record.totalChunks
    };
  }

  generateId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 创建上传器
 */
function createUploader(options) {
  return new FileUploader(options);
}

module.exports = {
  FileUploader,
  createUploader
};
