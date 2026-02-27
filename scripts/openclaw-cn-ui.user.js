// ==UserScript==
// @name         OpenClaw 中文界面
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  将 OpenClaw Control UI 翻译为中文
// @author       沈幼楚
// @match        http://localhost:18789/*
// @match        http://localhost:18788/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const translations = {
        // 导航菜单
        'Dashboard': '仪表盘',
        'Chat': '对话',
        'Channels': '通道',
        'Skills': '技能',
        'Cron': '定时任务',
        'Agents': '智能体',
        'Settings': '设置',
        'Logs': '日志',

        // 设置页面
        'Model': '模型',
        'Provider': '供应商',
        'API Key': 'API Key',
        'API Keys': 'API 密钥',
        'Configuration': '配置',
        'Security': '安全',
        'Notifications': '通知',
        'Language': '语言',
        'Theme': '主题',
        'About': '关于',

        // 按钮
        'Save': '保存',
        'Cancel': '取消',
        'Delete': '删除',
        'Edit': '编辑',
        'Add': '添加',
        'Refresh': '刷新',
        'Start': '启动',
        'Stop': '停止',
        'Restart': '重启',
        'Enable': '启用',
        'Disable': '禁用',

        // 状态
        'Online': '在线',
        'Offline': '离线',
        'Running': '运行中',
        'Stopped': '已停止',
        'Error': '错误',
        'Success': '成功',
        'Loading': '加载中...',

        // 通用
        'Name': '名称',
        'Status': '状态',
        'Type': '类型',
        'Value': '值',
        'Description': '描述',
        'Created': '创建时间',
        'Updated': '更新时间',
        'Actions': '操作',
        'Confirm': '确认',
        'Yes': '是',
        'No': '否',
        'Search': '搜索',
        'Filter': '过滤',
        'Clear': '清除',
        'Copy': '复制',
        'Download': '下载',
        'Upload': '上传',

        // 通道
        'Telegram': 'Telegram',
        'Discord': 'Discord',
        'WhatsApp': 'WhatsApp',
        'Slack': 'Slack',
        'Webchat': '网页聊天',
        'Feishu': '飞书',

        // Agent设置
        'Model Settings': '模型设置',
        'System Prompt': '系统提示词',
        'Temperature': '温度',
        'Max Tokens': '最大令牌',
        'Tools': '工具',
        'Instructions': '指令',

        // 日志
        'Level': '级别',
        'Message': '消息',
        'Timestamp': '时间戳',
        'Debug': '调试',
        'Info': '信息',
        'Warning': '警告',
        'Error': '错误',

        // Cron
        'Schedule': '计划',
        'Enabled': '已启用',
        'Last Run': '上次运行',
        'Next Run': '下次运行',

        // 其他常用
        'Overview': '概览',
        'Usage': '使用量',
        'Sessions': '会话',
        'Memory': '记忆',
        'Skills Market': '技能市场',
        'Local Skills': '本地技能',
        'Installed': '已安装',
        'Available': '可用',
        'Update': '更新',
        'Version': '版本',
        'Check Update': '检查更新',
        'Gateway': '网关',
        'Status Details': '状态详情',
    };

    // 递归翻译所有文本节点
    function translateNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text && translations[text]) {
                node.textContent = node.textContent.replace(text, translations[text]);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 跳过脚本和样式
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;

            // 翻译属性
            if (node.placeholder && translations[node.placeholder]) {
                node.placeholder = translations[node.placeholder];
            }
            if (node.title && translations[node.title]) {
                node.title = translations[node.title];
            }

            // 递归子节点
            node.childNodes.forEach(translateNode);
        }
    }

    // 监听DOM变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(translateNode);
        });
    });

    // 开始翻译
    function init() {
        translateNode(document.body);
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('🧡 OpenClaw 中文界面已加载');
    }

    // 等待页面加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
