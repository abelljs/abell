const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const { createPathIfAbsent } = require('../../../src/utils/helpers');

const beforeBuild = async () => {
  const user = 'abelljs';
  const repo = 'abell';
  const filterByLabelName = 'bug';

  const REMOTE_API = `https://api.github.com/repos/${user}/${repo}/issues?access_token=${
    process.env.PERSONAL_TOKEN || ''
  }`;
  const githubIssuesRes = await fetch(REMOTE_API);
  const githubIssuesData = await githubIssuesRes.json();
  const issues = githubIssuesData;

  const filteredIssue = issues.filter((i) => {
    if (
      !i.pull_request &&
      i.state === 'open' &&
      i.labels.some((label) => label.name == filterByLabelName)
    ) {
      return true;
    }
    return false;
  });

  const createMeta = (p, issue) => {
    const { title, body, created_at } = issue;
    const meta = `\r
      {
        "title": "${title}",
        "description": "${body.replace(/\r?\n|\r/gm, '').slice(0, 10)}",
        "$createdAt": "${created_at}"
      }
    `;
    fs.writeFileSync(path.join(p, 'meta.json'), JSON.stringify(meta));
  };

  filteredIssue.forEach((issue) => {
    const p = path.join(process.cwd(), 'content', issue.title);
    createPathIfAbsent(p);
    createMeta(p, issue);
    fs.writeFileSync(path.join(p, 'index.md'), issue.body);
  });
};

module.exports = { beforeBuild };
