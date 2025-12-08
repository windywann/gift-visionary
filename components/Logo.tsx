import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 礼盒主体 */}
      <rect x="40" y="80" width="120" height="100" rx="16" fill="#EBCBCB" /> 
      
      {/* 礼盒盖子阴影 */}
      <path d="M36 80C36 71.1634 43.1634 64 52 64H148C156.837 64 164 71.1634 164 80V96H36V80Z" fill="#D4A5A5" fillOpacity="0.2"/>
      
      {/* 礼盒盖子 */}
      <rect x="30" y="60" width="140" height="36" rx="12" fill="#98BEDE" /> 
      
      {/* 丝带 - 垂直部分 */}
      <rect x="90" y="60" width="20" height="120" fill="#FFFFFF" fillOpacity="0.4" />
      
      {/* 蝴蝶结 - 左部分 */}
      <path d="M100 66C100 66 70 30 50 45C30 60 60 70 100 66Z" fill="#F5E6E8" />
      <path d="M100 66C100 66 70 30 50 45C30 60 60 70 100 66Z" stroke="#D4A5A5" strokeWidth="2" strokeOpacity="0.5"/>
      
      {/* 蝴蝶结 - 右部分 */}
      <path d="M100 66C100 66 130 30 150 45C170 60 140 70 100 66Z" fill="#F5E6E8" /> 
      <path d="M100 66C100 66 130 30 150 45C170 60 140 70 100 66Z" stroke="#D4A5A5" strokeWidth="2" strokeOpacity="0.5"/>
      
      {/* 蝴蝶结中心 */}
      <circle cx="100" cy="66" r="8" fill="#F2F2F7" stroke="#D4A5A5" strokeWidth="2" strokeOpacity="0.5"/>
      
      {/* 星星装饰 */}
      <path d="M160 30L163 38L170 40L163 42L160 50L157 42L150 40L157 38L160 30Z" fill="#EBCBCB" />
      <path d="M40 140L42 146L48 148L42 150L40 156L38 150L32 148L38 146L40 140Z" fill="#98BEDE" />
      
      {/* AI 科技感元素 (眼睛/相机镜头) */}
      <circle cx="100" cy="130" r="24" fill="white" fillOpacity="0.8" />
      <circle cx="100" cy="130" r="16" fill="#EBCBCB" fillOpacity="0.5" />
      <circle cx="100" cy="130" r="8" fill="#98BEDE" />
      
      {/* 微笑弧线 */}
      <path d="M85 130C85 130 92 145 115 130" stroke="#D4A5A5" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8"/>
    </svg>
  );
};

export default Logo;

