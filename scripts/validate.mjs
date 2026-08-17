#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_FIELDS = [
  'no',
  'cat',
  'q',
  'a',
  'short',
  'body',
  'src',
  'srcMeta',
  'qe',
  'ae',
  'shorte',
  'bodye',
];

const CATEGORIES = new Set([
  '自然',
  '天文',
  '人体',
  '物理',
  '历史',
  '语言',
  '城市',
  '食物',
  '数学',
  '艺术',
]);

const PLATE_TYPES = new Set(['bars', 'curve', 'stat', 'slot']);
const WIKIMEDIA_PREFIX = 'https://upload.wikimedia.org/';
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultFile = path.resolve(scriptDirectory, '../content/latest.json');
const targetFile = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : defaultFile;

let data;

try {
  data = JSON.parse(await readFile(targetFile, 'utf8'));
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`✗ 无法读取或解析 JSON：${targetFile}`);
  console.error(`- ${detail}`);
  process.exit(1);
}

const errors = [];

function display(value) {
  const encoded = JSON.stringify(value);
  return encoded === undefined ? String(value) : encoded;
}

function cardLabel(card, index) {
  if (isObject(card) && hasOwn(card, 'no')) {
    return `卡片 ${display(card.no)}`;
  }

  return `卡片索引 ${index}（no 缺失）`;
}

function validateImgFields(value, fieldPath, owner) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateImgFields(item, `${fieldPath}[${index}]`, owner));
    return;
  }

  if (!isObject(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = fieldPath ? `${fieldPath}.${key}` : key;

    if (
      key === 'img'
      && (typeof nestedValue !== 'string' || !nestedValue.startsWith(WIKIMEDIA_PREFIX))
    ) {
      errors.push(
        `${owner}：字段 ${nestedPath} 必须是以 ${WIKIMEDIA_PREFIX} 开头的字符串（当前值：${display(nestedValue)}）`,
      );
    }

    validateImgFields(nestedValue, nestedPath, owner);
  }
}

if (!isObject(data)) {
  errors.push('顶层：必须是 JSON 对象');
} else if (!Array.isArray(data.cards)) {
  errors.push('顶层：字段 cards 必须是数组');
} else {
  if (data.count !== data.cards.length) {
    errors.push(
      `顶层：count 必须严格等于 cards.length（count=${display(data.count)}，cards.length=${data.cards.length}）`,
    );
  }

  const seenNumbers = new Map();

  data.cards.forEach((card, index) => {
    const owner = cardLabel(card, index);

    if (!isObject(card)) {
      errors.push(`${owner}：必须是 JSON 对象（当前值：${display(card)}）`);
      return;
    }

    for (const field of REQUIRED_FIELDS) {
      if (!hasOwn(card, field)) {
        errors.push(`${owner}：缺少必填字段 ${field}`);
      }
    }

    if (hasOwn(card, 'no')) {
      if (seenNumbers.has(card.no)) {
        const firstIndex = seenNumbers.get(card.no);
        errors.push(`${owner}：字段 no 重复（首次出现在卡片索引 ${firstIndex}）`);
      } else {
        seenNumbers.set(card.no, index);
      }
    }

    for (const field of ['body', 'bodye']) {
      if (hasOwn(card, field) && (!Array.isArray(card[field]) || card[field].length !== 3)) {
        const description = Array.isArray(card[field])
          ? `${card[field].length} 段`
          : `非数组 ${display(card[field])}`;
        errors.push(`${owner}：字段 ${field} 必须恰好包含 3 段（当前：${description}）`);
      }
    }

    if (hasOwn(card, 'cat') && !CATEGORIES.has(card.cat)) {
      errors.push(`${owner}：字段 cat 的值不在允许列表中（当前值：${display(card.cat)}）`);
    }

    if (isObject(card.plate) && hasOwn(card.plate, 'type') && !PLATE_TYPES.has(card.plate.type)) {
      errors.push(
        `${owner}：字段 plate.type 必须是 bars/curve/stat/slot 之一（当前值：${display(card.plate.type)}）`,
      );
    }

    validateImgFields(card, '', owner);
  });

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'cards') {
      validateImgFields(value, key, '顶层');
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ 内容校验失败：${errors.length} 项问题`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`✓ 内容校验通过：${data.cards.length} 张卡，count 一致，卡片编号全库唯一。`);
