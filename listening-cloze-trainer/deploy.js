#!/usr/bin/env node
/**
 * 听空 ListenCloze — 一键部署脚本
 * 用法: node deploy.js
 *
 * 三种认证方式（按优先级自动选择）:
 *   1. 环境变量 SURGE_LOGIN + SURGE_TOKEN
 *   2. 环境变量 SURGE_EMAIL + SURGE_PASSWORD
 *   3. 内置凭证（见 deploy-credentials.json）
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── 配置 ────────────────────────────────────────────
const CONFIG = {
  projectPath: path.resolve(__dirname),
  domain: 'listen-cloze-edit.surge.sh',
  email: 'trae-deploy@listen-cloze.app',
  password: 'TraeDeploy2026!',
  domainToken: 'ab60cb946b2f3e21bb07a9d48a868079',
  accountToken: '944cfec92fef02d0b6923a8d7ce8857f'
};

// ─── 部署函数 ────────────────────────────────────────
function deploy() {
  console.log('━'.repeat(50));
  console.log('  听空 ListenCloze 部署工具');
  console.log('  目标: https://' + CONFIG.domain);
  console.log('━'.repeat(50));

  // 检查 surge 是否安装
  try {
    execSync('surge --version', { stdio: 'pipe' });
  } catch (e) {
    console.log('正在安装 surge CLI...');
    execSync('npm install -g surge', { stdio: 'inherit' });
  }

  // 方式 1: 使用环境变量 token
  if (process.env.SURGE_LOGIN && process.env.SURGE_TOKEN) {
    console.log('\n使用环境变量 SURGE_LOGIN + SURGE_TOKEN 部署...');
    return runDeploy({
      SURGE_LOGIN: process.env.SURGE_LOGIN,
      SURGE_TOKEN: process.env.SURGE_TOKEN
    });
  }

  // 方式 2: 使用环境变量 email + password
  if (process.env.SURGE_EMAIL && process.env.SURGE_PASSWORD) {
    console.log('\n使用环境变量 SURGE_EMAIL + SURGE_PASSWORD 登录部署...');
    surgeLogin(process.env.SURGE_EMAIL, process.env.SURGE_PASSWORD);
    return runDeploy({});
  }

  // 方式 3: 使用内置 domain-scoped token
  console.log('\n使用内置域名 Token 部署...');
  return runDeploy({
    SURGE_LOGIN: CONFIG.email,
    SURGE_TOKEN: CONFIG.domainToken
  });
}

function surgeLogin(email, password) {
  console.log('登录 Surge 账户:', email);
  const result = spawnSync('surge', ['login'], {
    input: email + '\n' + password + '\n',
    stdio: ['pipe', 'inherit', 'inherit'],
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' }
  });
  if (result.status !== 0) {
    console.error('登录失败');
    process.exit(1);
  }
}

function runDeploy(envVars) {
  console.log('项目路径:', CONFIG.projectPath);
  console.log('部署域名:', CONFIG.domain);
  console.log('');

  const result = spawnSync('surge', [
    CONFIG.projectPath,
    '--domain', CONFIG.domain
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...envVars,
      NODE_USE_ENV_PROXY: '1'
    }
  });

  if (result.status === 0) {
    console.log('\n部署成功!');
    console.log('访问地址: https://' + CONFIG.domain);

    // 验证部署
    verifyDeploy();
  } else {
    console.error('\n部署失败，退出码:', result.status);
    console.log('\n备用方案:');
    console.log('  1. 尝试重新登录: surge login');
    console.log('     邮箱:', CONFIG.email);
    console.log('     密码:', CONFIG.password);
    console.log('  2. 创建新 token: surge tokens add --domain', CONFIG.domain);
    console.log('  3. 查看凭证文件: deploy-credentials.json');
    process.exit(result.status || 1);
  }
}

function verifyDeploy() {
  try {
    console.log('\n验证部署...');
    const html = execSync(
      'curl -s https://' + CONFIG.domain + '/',
      { encoding: 'utf8', timeout: 15000 }
    );

    const checks = [
      { name: '页面加载', test: html.includes('ListenCloze') },
      { name: '编辑模式按钮', test: html.includes('btn-edit-mode') },
      { name: '编辑模式逻辑', test: html.includes('editMode') },
      { name: '语种筛选', test: html.includes('语种') }
    ];

    let allPass = true;
    checks.forEach(c => {
      const status = c.test ? '通过' : '缺失';
      if (!c.test) allPass = false;
      console.log('  ' + (c.test ? '[OK]' : '[FAIL]') + ' ' + c.name + ': ' + status);
    });

    if (allPass) {
      console.log('\n所有功能验证通过!');
    } else {
      console.log('\n部分功能缺失，请检查代码完整性。');
    }
  } catch (e) {
    console.log('验证跳过（网络问题）:', e.message);
  }
}

deploy();
