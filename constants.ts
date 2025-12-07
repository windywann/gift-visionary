export const GENDERS = [
  { id: 'male', label: '男生', emoji: '🙋‍♂️' },
  { id: 'female', label: '女生', emoji: '🙋‍♀️' },
];

export const RELATIONS = [
  { id: 'partner', label: '伴侣', emoji: '💑' },
  { id: 'friend', label: '朋友', emoji: '👯' },
  { id: 'elder', label: '长辈', emoji: '👨‍👩‍👧' },
  { id: 'child', label: '孩子', emoji: '🍼' },
];

export const OCCASIONS = [
  { id: 'birthday', label: '生日', emoji: '🎂' },
  { id: 'anniversary', label: '纪念日', emoji: '❤️' },
  { id: 'thankyou', label: '感谢', emoji: '🙏' },
  { id: 'cny', label: '春节', emoji: '🧧' },
  { id: 'other', label: '其他', emoji: '🎁' },
];

export const INTEREST_TAGS = [
  '美妆护肤', '数码科技', '运动健身', '居家生活', 
  '美食', '阅读', '二次元', '宠物', '手工DIY', 
  '复古', '极简', '潮玩'
];

export const MOCK_FALLBACK_PRODUCTS = [
  {
    id: 'fb1',
    title: '星巴克星礼卡 - 通用礼物',
    price: 200,
    imageUrl: 'https://picsum.photos/400/400?random=101',
    source: '天猫',
    link: '#',
    tags: ['通用好礼'],
    keywords: '通用'
  },
  {
    id: 'fb2',
    title: 'GODIVA 歌帝梵巧克力礼盒',
    price: 358,
    imageUrl: 'https://picsum.photos/400/400?random=102',
    source: '京东',
    link: '#',
    tags: ['甜蜜', '通用'],
    keywords: '巧克力'
  }
] as const;