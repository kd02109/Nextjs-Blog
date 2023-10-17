'use client';
export default function checkAgent(): string {
  const agent = window.navigator.userAgent.toLowerCase();
  let broswerName: string;
  switch (true) {
    case agent.indexOf('edge') > -1:
      broswerName = 'MS Edge';
      break;
    case agent.indexOf('edg/') > -1:
      broswerName = 'Edge (chromium based)';
      break;
    case agent.indexOf('chrome') > -1:
      broswerName = 'Chrome';
      break;
    case agent.indexOf('firefox') > -1:
      broswerName = 'Mozilla Firefox';
      break;
    default:
      broswerName = 'other';
  }
  return broswerName;
}
