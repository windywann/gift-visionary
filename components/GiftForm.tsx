import React, { useState, useRef, useEffect } from 'react';
import { GiftRequest, RecipientProfile } from '../types';
import { RELATIONS, OCCASIONS, INTEREST_TAGS, GENDERS } from '../constants';
import Button from './Button';

interface GiftFormProps {
  onSubmit: (request: GiftRequest) => void;
  recentProfiles: RecipientProfile[];
  onLoadProfile: (profile: RecipientProfile) => void;
}

const GiftForm: React.FC<GiftFormProps> = ({ onSubmit, recentProfiles, onLoadProfile }) => {
  const [step, setStep] = useState(1);
  const [isCustomRelation, setIsCustomRelation] = useState(false);
  
  // Custom Interest State
  const [customInterest, setCustomInterest] = useState('');
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]); // Store user-added tags

  const [formData, setFormData] = useState<GiftRequest>({
    nickname: '',
    gender: '',
    relation: '',
    occasion: '',
    budgetMin: 200,
    budgetMax: 1000,
    interests: [],
    remarks: ''
  });

  const updateField = (key: keyof GiftRequest, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleInterestToggle = (tag: string) => {
    setFormData(prev => {
      const exists = prev.interests.includes(tag);
      return {
        ...prev,
        interests: exists 
          ? prev.interests.filter(t => t !== tag)
          : [...prev.interests, tag]
      };
    });
  };

  const handleAddCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (!trimmed) {
      setIsAddingInterest(false);
      return;
    }

    // 1. Check if it's already a default tag
    if (INTEREST_TAGS.includes(trimmed)) {
      if (!formData.interests.includes(trimmed)) {
        handleInterestToggle(trimmed);
      }
      setCustomInterest('');
      setIsAddingInterest(false);
      return;
    }

    // 2. Add to custom tags (prevent duplicates)
    setCustomTags(prev => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
    
    // 3. Auto-select the newly added tag (prevent duplicates)
    setFormData(prev => {
      if (prev.interests.includes(trimmed)) return prev;
      return { ...prev, interests: [...prev.interests, trimmed] };
    });

    setCustomInterest('');
    setIsAddingInterest(false);
  };

  const handleRelationSelect = (relationId: string) => {
    setIsCustomRelation(false);
    updateField('relation', relationId);
  };

  const enableCustomRelation = () => {
    setIsCustomRelation(true);
    updateField('relation', ''); // Clear relation so user can type
  };

  // --- Dual Range Slider Logic ---
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);
  const PRICE_GAP = 100;
  const MAX_PRICE = 5000;

  // Update progress bar range styling
  useEffect(() => {
    if (range.current) {
      const minPercent = (formData.budgetMin / MAX_PRICE) * 100;
      const maxPercent = (formData.budgetMax / MAX_PRICE) * 100;
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [formData.budgetMin, formData.budgetMax]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = Math.min(Number(e.target.value), MAX_PRICE);
    
    if (type === 'min') {
      if (value <= formData.budgetMax - PRICE_GAP) {
        updateField('budgetMin', value);
      }
    } else {
      if (value >= formData.budgetMin + PRICE_GAP) {
        updateField('budgetMax', value);
      }
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    if (!formData.nickname || !formData.relation) return; // Basic validation
    onSubmit(formData);
  };

  // Quick Profile Loader
  const handleProfileClick = (profile: RecipientProfile) => {
    onLoadProfile(profile);
    if (profile.lastRequest) {
      setFormData({
        ...profile.lastRequest,
        occasion: '', // Reset occasion for new gift
        remarks: ''   // Reset remarks
      });
      // Detect if relation was custom
      const isPreset = RELATIONS.some(r => r.id === profile.lastRequest?.relation);
      setIsCustomRelation(!isPreset);
      
      setStep(2); // Jump to step 2
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white">
      
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8 px-2 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300
              ${step >= s ? 'bg-macaron-pink text-white' : 'bg-white text-gray-300 border border-gray-100'}`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6 animate-jelly">
          {/* Nickname */}
          <div>
            <label className="block text-sm font-bold text-macaron-textMain mb-2">送给谁？</label>
            <input 
              type="text" 
              placeholder="对方昵称 (如: 宝贝, 妈妈)"
              className="w-full px-4 py-3 rounded-xl bg-macaron-bg border-none focus:ring-2 focus:ring-macaron-pink/50 outline-none transition-all text-macaron-textMain placeholder-gray-300"
              value={formData.nickname}
              onChange={(e) => updateField('nickname', e.target.value)}
            />
          </div>

          {/* Gender */}
          <div>
             <label className="block text-sm font-bold text-macaron-textMain mb-3">性别</label>
             <div className="grid grid-cols-2 gap-3">
               {GENDERS.map(gen => (
                 <button
                   key={gen.id}
                   onClick={() => updateField('gender', gen.id)}
                   className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all
                     ${formData.gender === gen.id 
                       ? 'bg-macaron-blue text-macaron-textMain shadow-inner font-bold ring-2 ring-macaron-blue/50' 
                       : 'bg-white hover:bg-gray-50 text-macaron-textSub'}`}
                 >
                   <span className="text-xl">{gen.emoji}</span>
                   {gen.label}
                 </button>
               ))}
             </div>
          </div>

          {/* Relation */}
          <div>
            <label className="block text-sm font-bold text-macaron-textMain mb-3">关系是？</label>
            {!isCustomRelation ? (
              <div className="grid grid-cols-3 gap-3">
                {RELATIONS.map(rel => (
                  <button
                    key={rel.id}
                    onClick={() => handleRelationSelect(rel.id)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all
                      ${formData.relation === rel.id 
                        ? 'bg-macaron-purple text-macaron-textMain shadow-inner font-bold ring-2 ring-macaron-purple/50' 
                        : 'bg-white hover:bg-gray-50 text-macaron-textSub'}`}
                  >
                    <span className="text-xl">{rel.emoji}</span>
                    <span className="text-xs">{rel.label}</span>
                  </button>
                ))}
                {/* Custom Button */}
                <button
                    onClick={enableCustomRelation}
                    className="p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all bg-white hover:bg-gray-50 text-macaron-textSub border-2 border-dashed border-gray-200"
                  >
                    <span className="text-xl">✏️</span>
                    <span className="text-xs">自定义</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="请输入具体关系 (如: 老师, 同事)"
                     autoFocus
                     className="flex-1 px-4 py-3 rounded-xl bg-macaron-bg border-none focus:ring-2 focus:ring-macaron-purple/50 outline-none transition-all text-macaron-textMain placeholder-gray-300"
                     value={formData.relation}
                     onChange={(e) => updateField('relation', e.target.value)}
                   />
                   <button 
                     onClick={() => setIsCustomRelation(false)}
                     className="px-4 rounded-xl bg-gray-100 text-macaron-textSub hover:bg-gray-200 text-xs font-bold"
                   >
                     取消
                   </button>
                 </div>
              </div>
            )}
          </div>

          {/* Recent Profiles */}
          {recentProfiles.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-macaron-textSub mb-2">老朋友快捷入口</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recentProfiles.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => handleProfileClick(p)}
                    className="flex-shrink-0 flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-macaron-yellow flex items-center justify-center text-macaron-textMain text-xs font-bold border-2 border-white shadow-sm">
                      {p.nickname.charAt(0)}
                    </div>
                    <span className="text-[10px] text-gray-400">{p.nickname}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button fullWidth onClick={nextStep} disabled={!formData.nickname || !formData.relation || !formData.gender}>
            下一步
          </Button>
        </div>
      )}

      {/* Step 2: Occasion & Budget */}
      {step === 2 && (
        <div className="space-y-6 animate-jelly">
          <div>
            <label className="block text-sm font-bold text-macaron-textMain mb-3">为了什么送礼？</label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map(occ => (
                <button
                  key={occ.id}
                  onClick={() => updateField('occasion', occ.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all
                    ${formData.occasion === occ.id 
                      ? 'bg-macaron-pink text-white shadow-md transform scale-105' 
                      : 'bg-white text-macaron-textSub hover:bg-macaron-bg'}`}
                >
                  {occ.emoji} {occ.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dual Range Budget Slider */}
          <div>
            <label className="block text-sm font-bold text-macaron-textMain mb-4">
              预算范围: <span className="text-macaron-purple font-display">¥{formData.budgetMin} - ¥{formData.budgetMax}</span>
            </label>
            <div className="relative w-full h-8 flex items-center px-2">
              {/* Slider Track Background */}
              <div className="absolute w-full h-2 bg-gray-200 rounded-full z-0"></div>
              
              {/* Active Range Track */}
              <div 
                ref={range}
                className="absolute h-2 bg-macaron-pink rounded-full z-10"
              ></div>

              {/* Min Input */}
              <input 
                type="range" 
                min="0" 
                max={MAX_PRICE} 
                step="50"
                value={formData.budgetMin}
                ref={minValRef}
                onChange={(e) => handleBudgetChange(e, 'min')}
                className="pointer-events-none absolute w-full h-0 z-20 appearance-none
                  [&::-webkit-slider-thumb]:pointer-events-auto 
                  [&::-webkit-slider-thumb]:w-6 
                  [&::-webkit-slider-thumb]:h-6 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-white 
                  [&::-webkit-slider-thumb]:border-2 
                  [&::-webkit-slider-thumb]:border-macaron-pink 
                  [&::-webkit-slider-thumb]:shadow-md 
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-moz-range-thumb]:pointer-events-auto 
                  [&::-moz-range-thumb]:w-6 
                  [&::-moz-range-thumb]:h-6 
                  [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:border-none"
              />

              {/* Max Input */}
              <input 
                type="range" 
                min="0" 
                max={MAX_PRICE}
                step="50" 
                value={formData.budgetMax}
                ref={maxValRef}
                onChange={(e) => handleBudgetChange(e, 'max')}
                className="pointer-events-none absolute w-full h-0 z-20 appearance-none
                  [&::-webkit-slider-thumb]:pointer-events-auto 
                  [&::-webkit-slider-thumb]:w-6 
                  [&::-webkit-slider-thumb]:h-6 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-white 
                  [&::-webkit-slider-thumb]:border-2 
                  [&::-webkit-slider-thumb]:border-macaron-pink 
                  [&::-webkit-slider-thumb]:shadow-md 
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-moz-range-thumb]:pointer-events-auto 
                  [&::-moz-range-thumb]:w-6 
                  [&::-moz-range-thumb]:h-6 
                  [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:border-none"
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-400 mt-2">
               <span>¥0</span>
               <span>¥{MAX_PRICE}+</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="w-1/3">上一步</Button>
            <Button fullWidth onClick={nextStep} disabled={!formData.occasion}>下一步</Button>
          </div>
        </div>
      )}

      {/* Step 3: Detailed Preferences */}
      {step === 3 && (
        <div className="space-y-6 animate-jelly">
          <div>
            <label className="block text-sm font-bold text-macaron-textMain mb-3">TA的喜好 (多选)</label>
            <div className="flex flex-wrap gap-2">
              {/* Combine default tags with user custom tags */}
              {[...INTEREST_TAGS, ...customTags].map(tag => (
                <button
                  key={tag}
                  onClick={() => handleInterestToggle(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${formData.interests.includes(tag)
                      ? 'bg-macaron-blue/50 border-macaron-blue text-macaron-textMain' 
                      : 'bg-transparent border-gray-100 text-gray-400 hover:border-macaron-blue'}`}
                >
                  {tag}
                </button>
              ))}

              {/* Add Custom Interest Input/Button */}
              {isAddingInterest ? (
                <div className="flex items-center animate-jelly">
                  <input
                    type="text"
                    autoFocus
                    placeholder="输入喜好..."
                    className="w-24 px-2 py-1.5 rounded-l-lg text-xs border border-r-0 border-macaron-pink focus:outline-none bg-white text-macaron-textMain"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomInterest();
                    }}
                  />
                  <button 
                    onClick={handleAddCustomInterest}
                    className="px-2 py-1.5 rounded-r-lg text-xs bg-macaron-pink text-white font-bold border border-l-0 border-macaron-pink hover:bg-macaron-pinkDark transition-colors"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingInterest(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-dashed border-gray-300 text-gray-400 hover:border-macaron-pink hover:text-macaron-pink"
                >
                  + 自定义
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-macaron-textMain mb-2">有什么特别备注吗？</label>
            <textarea 
              placeholder="比如：不喜欢太甜的，最近在减肥，喜欢紫色..."
              className="w-full px-4 py-3 rounded-xl bg-macaron-bg border-none focus:ring-2 focus:ring-macaron-pink/50 outline-none transition-all text-macaron-textMain placeholder-gray-300 text-sm min-h-[80px]"
              value={formData.remarks}
              onChange={(e) => updateField('remarks', e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="w-1/3">上一步</Button>
            <Button fullWidth onClick={handleSubmit}>生成推荐 ✨</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftForm;