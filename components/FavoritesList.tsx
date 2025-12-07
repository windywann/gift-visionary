import React, { useState } from 'react';
import { RecipientProfile, Product } from '../types';
import ProductCard from './ProductCard';
import Button from './Button';

interface FavoritesListProps {
  profiles: RecipientProfile[];
  onRemoveFavorite: (recipientId: string, productId: string) => void;
  onBack: () => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ profiles, onRemoveFavorite, onBack }) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);

  const selectedProfile = profiles.find(p => p.id === selectedRecipientId);

  // Filter out profiles with no saved products
  const activeProfiles = profiles.filter(p => p.savedProducts.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6 text-macaron-textMain" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-display font-bold text-macaron-textMain">我的心愿单 💝</h2>
      </div>

      {activeProfiles.length === 0 ? (
        <div className="text-center py-20 text-macaron-textSub">
          <p className="text-4xl mb-4">🕸️</p>
          <p>还没收藏过礼物呢，快去首页逛逛吧！</p>
          <Button onClick={onBack} className="mt-6 mx-auto">去挑选礼物</Button>
        </div>
      ) : !selectedRecipientId ? (
        // Folder View
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {activeProfiles.map(profile => (
            <div 
              key={profile.id}
              onClick={() => setSelectedRecipientId(profile.id)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center gap-3 border border-transparent hover:border-macaron-pink/30"
            >
              <div className="w-16 h-16 rounded-full bg-macaron-pink/20 flex items-center justify-center text-2xl">
                {profile.nickname.charAt(0)}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-macaron-textMain">{profile.nickname}</h3>
                <p className="text-xs text-macaron-textSub mt-1">{profile.savedProducts.length} 件商品</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Detail View
        <div>
          <div className="flex items-center gap-2 mb-6 bg-white/50 p-3 rounded-xl">
             <button onClick={() => setSelectedRecipientId(null)} className="text-sm text-macaron-pink font-bold hover:underline">
               &lt; 返回列表
             </button>
             <span className="text-gray-300">|</span>
             <span className="font-bold text-macaron-textMain">{selectedProfile?.nickname} 的清单</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedProfile?.savedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isLiked={true} 
                onToggleLike={() => onRemoveFavorite(selectedProfile.id, product.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;
