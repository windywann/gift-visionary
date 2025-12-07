import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isLiked: boolean;
  onToggleLike: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isLiked, onToggleLike }) => {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container with Cover Mode */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Source Badge */}
        <div className="absolute top-2 left-2 bg-macaron-bg/90 backdrop-blur-xs px-2 py-1 rounded-lg text-xs font-bold text-macaron-textMain flex items-center shadow-sm">
          <span className={`w-2 h-2 rounded-full mr-1 ${product.source === '京东' ? 'bg-red-500' : product.source === '天猫' ? 'bg-red-600' : 'bg-orange-500'}`}></span>
          {product.source}
        </div>
        
        {/* Like Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(product);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all active:scale-90"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isLiked ? "#EBCBCB" : "none"} 
            stroke={isLiked ? "#EBCBCB" : "#888888"} 
            strokeWidth="2" 
            className={`w-6 h-6 transition-colors duration-300 ${isLiked ? 'animate-jelly' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-macaron-textMain line-clamp-2 h-10 leading-5 mb-2">
          {product.title}
        </h3>

        {/* Tags */}
        <div className="flex gap-1 mb-2 flex-wrap">
          {product.tags
            .filter(tag => tag !== '图片搜索')
            .map(tag => (
              <span key={tag} className="text-[10px] bg-macaron-blue px-2 py-0.5 rounded-md text-macaron-textMain opacity-80">
                {tag}
              </span>
            ))}
        </div>

        {/* Footer: Price & Buy */}
        <div className="flex items-end justify-between mt-1">
          <div className="text-macaron-purple font-display font-bold text-lg">
            <span className="text-xs">¥</span>{product.price}
          </div>
          <a 
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-macaron-pink text-white px-3 py-1.5 rounded-xl font-bold hover:bg-macaron-pinkDark transition-colors"
          >
            去购买
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
