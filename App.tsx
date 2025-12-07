import React, { useState, useEffect } from 'react';
import GiftForm from './components/GiftForm';
import ProductCard from './components/ProductCard';
import LoadingOverlay from './components/LoadingOverlay';
import FavoritesList from './components/FavoritesList';
import Button from './components/Button';
import { GiftRequest, Product, LoadingStage, RecipientProfile } from './types';
import { generateGiftKeywords } from './services/deepseekService';
import { searchProductsByKeywords } from './services/searchService';
import { MOCK_FALLBACK_PRODUCTS } from './constants';

type SortOption = 'RECOMMENDED' | 'PRICE_ASC' | 'PRICE_DESC';

const App: React.FC = () => {
  // --- State Management ---
  const [view, setView] = useState<'HOME' | 'RESULTS' | 'FAVORITES'>('HOME');
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(LoadingStage.IDLE);
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const [aiReasoning, setAiReasoning] = useState<string>("");
  const [currentRequest, setCurrentRequest] = useState<GiftRequest | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('RECOMMENDED');
  
  // Persistence (Simulated DB)
  const [profiles, setProfiles] = useState<RecipientProfile[]>(() => {
    const saved = localStorage.getItem('gift_profiles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gift_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // --- Handlers ---

  const handleFormSubmit = async (request: GiftRequest) => {
    setCurrentRequest(request);
    setLoadingStage(LoadingStage.ANALYZING);
    setGeneratedKeywords([]);
    setResults([]);
    setSortOption('RECOMMENDED'); // Reset sort

    try {
      // 1. Analysis Phase (Visual delay)
      await new Promise(r => setTimeout(r, 2000));
      
      // 2. AI Generation
      setLoadingStage(LoadingStage.GENERATING);
      const aiResponse = await generateGiftKeywords(request);
      setGeneratedKeywords(aiResponse.keywords);
      setAiReasoning(aiResponse.reasoning);

      // 3. Search Phase
      // Small delay to let user see keywords
      await new Promise(r => setTimeout(r, 1500)); 
      setLoadingStage(LoadingStage.SEARCHING);
      
      const searchResults = await searchProductsByKeywords(
        aiResponse.keywords, 
        request.budgetMin, 
        request.budgetMax
      );
      
      setResults(searchResults.length > 0 ? searchResults : [...MOCK_FALLBACK_PRODUCTS]);
      
      // Complete
      setLoadingStage(LoadingStage.COMPLETED);
      setView('RESULTS');
      
      // Save/Update Profile for "Recent" list
      updateProfileHistory(request);

    } catch (error) {
      console.error(error);
      setLoadingStage(LoadingStage.ERROR);
      setResults([...MOCK_FALLBACK_PRODUCTS]);
      setView('RESULTS');
    }
  };

  const updateProfileHistory = (request: GiftRequest) => {
    setProfiles(prev => {
      const existingIdx = prev.findIndex(p => p.nickname === request.nickname);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          lastRequest: request,
          relation: request.relation // Update relation just in case
        };
        return updated;
      } else {
        return [...prev, {
          id: Date.now().toString(),
          nickname: request.nickname,
          relation: request.relation,
          savedProducts: [],
          lastRequest: request
        }];
      }
    });
  };

  const handleToggleLike = (product: Product) => {
    if (!currentRequest) return;

    setProfiles(prev => {
      return prev.map(p => {
        if (p.nickname === currentRequest.nickname) {
          const isSaved = p.savedProducts.some(sp => sp.id === product.id);
          let newSaved;
          if (isSaved) {
            newSaved = p.savedProducts.filter(sp => sp.id !== product.id);
          } else {
            newSaved = [...p.savedProducts, product];
          }
          return { ...p, savedProducts: newSaved };
        }
        return p;
      });
    });
  };

  const handleRemoveFavorite = (recipientId: string, productId: string) => {
     setProfiles(prev => prev.map(p => {
       if (p.id === recipientId) {
         return {
           ...p,
           savedProducts: p.savedProducts.filter(sp => sp.id !== productId)
         };
       }
       return p;
     }));
  };

  const isProductLiked = (productId: string) => {
    if (!currentRequest) return false;
    const profile = profiles.find(p => p.nickname === currentRequest.nickname);
    return profile?.savedProducts.some(sp => sp.id === productId) || false;
  };

  // --- Sorting Logic ---
  const getSortedResults = () => {
    const sorted = [...results];
    if (sortOption === 'PRICE_ASC') {
      return sorted.sort((a, b) => a.price - b.price);
    }
    if (sortOption === 'PRICE_DESC') {
      return sorted.sort((a, b) => b.price - a.price);
    }
    return sorted; // Default (Random/Relevance)
  };

  const sortedResults = getSortedResults();

  // --- Render ---

  return (
    <div className="min-h-screen bg-macaron-bg font-sans text-macaron-textMain selection:bg-macaron-pink/30 pb-10">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-macaron-bg/90 backdrop-blur-md border-b border-macaron-pink/10 px-6 py-4 flex justify-between items-center shadow-sm">
        <div 
          className="flex flex-col cursor-pointer" 
          onClick={() => { setView('HOME'); setLoadingStage(LoadingStage.IDLE); }}
        >
          <h1 className="text-2xl font-display font-bold text-macaron-pinkDark tracking-wide">
            礼想家
          </h1>
          <p className="text-[10px] text-macaron-textSub font-medium tracking-widest uppercase">
            Gift Visionary
          </p>
        </div>
        
        <button 
          onClick={() => setView('FAVORITES')}
          className="relative p-2 rounded-full hover:bg-white transition-colors"
        >
          <span className="text-2xl">🎁</span>
          {profiles.reduce((acc, p) => acc + p.savedProducts.length, 0) > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-400 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
              {profiles.reduce((acc, p) => acc + p.savedProducts.length, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-8">
        
        {view === 'HOME' && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-3xl font-display font-bold text-macaron-textMain">
                不知道送什么？
              </h2>
              <p className="text-macaron-textSub text-sm">
                告诉我 TA 的画像，剩下的交给 AI 顾问
              </p>
            </div>
            
            <GiftForm 
              onSubmit={handleFormSubmit} 
              recentProfiles={profiles}
              onLoadProfile={(p) => console.log("Loaded profile", p)} 
            />
          </div>
        )}

        {view === 'RESULTS' && (
          <div className="max-w-5xl mx-auto animate-jelly">
            {/* Reasoning Banner */}
            {aiReasoning && (
              <div className="bg-gradient-to-r from-macaron-pink/20 to-macaron-purple/20 p-4 rounded-2xl mb-8 flex items-start gap-3">
                 <span className="text-2xl">💌</span>
                 <p className="text-sm leading-relaxed italic text-macaron-textMain pt-1">
                   "{aiReasoning}"
                 </p>
              </div>
            )}

            <div className="flex justify-between items-center mb-6 px-2">
               <h3 className="font-bold text-lg">
                 为 <span className="text-macaron-pinkDark font-display">{currentRequest?.nickname}</span> 挑选的灵感
               </h3>
               <div className="flex gap-2">
                 <select 
                   className="bg-white border-none text-xs rounded-lg px-3 py-2 outline-none shadow-sm text-macaron-textSub cursor-pointer focus:ring-2 focus:ring-macaron-pink/20"
                   value={sortOption}
                   onChange={(e) => setSortOption(e.target.value as SortOption)}
                 >
                   <option value="RECOMMENDED">综合推荐</option>
                   <option value="PRICE_ASC">价格由低到高</option>
                   <option value="PRICE_DESC">价格由高到低</option>
                 </select>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {sortedResults.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isLiked={isProductLiked(product.id)}
                  onToggleLike={handleToggleLike}
                />
              ))}
            </div>

            <div className="mt-12 text-center pb-8">
              <Button variant="outline" onClick={() => setView('HOME')}>
                重新咨询
              </Button>
            </div>
          </div>
        )}

        {view === 'FAVORITES' && (
          <FavoritesList 
            profiles={profiles} 
            onRemoveFavorite={handleRemoveFavorite}
            onBack={() => setView('HOME')}
          />
        )}
      </main>

      {/* Loading Overlay */}
      <LoadingOverlay stage={loadingStage} generatedKeywords={generatedKeywords} />

    </div>
  );
};

export default App;