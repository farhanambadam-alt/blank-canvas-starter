import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import type { Artist, Review } from '@/types/salon';

interface ReviewsSectionProps {
  artists: Artist[];
  reviews: Review[];
  selectedArtist: string | null;
  onSelectArtist: (id: string | null) => void;
}

const ReviewsSection = ({ artists, reviews, selectedArtist, onSelectArtist }: ReviewsSectionProps) => {
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [isJiggling, setIsJiggling] = useState(false);
  const [tabStyle, setTabStyle] = useState<{ left: number; width: number } | null>(null);

  const artistRowRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredReviews = reviews.filter((r) => {
    if (selectedArtist && r.artistId !== selectedArtist) return false;
    if (reviewFilter === 'all') return true;
    if (reviewFilter === '5') return r.rating === 5;
    if (reviewFilter === '4') return r.rating >= 4;
    if (reviewFilter === 'photos') return r.hasPhoto;
    return true;
  });

  const currentArtist = artists.find((a) => a.id === selectedArtist);
  const avgRating = filteredReviews.length > 0
    ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
    : '0.0';

  const reviewPhotos = [
    'https://images.unsplash.com/photo-1585747860019-8e8e13c2e4f2?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=300&h=300&fit=crop',
  ];

  // Measure and position the sliding tab
  const updateTabPosition = useCallback(() => {
    const key = selectedArtist ?? '_all';
    const btn = buttonRefs.current.get(key);
    const row = artistRowRef.current;
    if (!btn || !row) return;

    const rowRect = row.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setTabStyle({
      left: btnRect.left - rowRect.left,
      width: btnRect.width,
    });
  }, [selectedArtist]);

  useEffect(() => {
    updateTabPosition();
  }, [updateTabPosition]);

  // Trigger jiggle on artist change
  useEffect(() => {
    setIsJiggling(true);
    const timer = setTimeout(() => setIsJiggling(false), 600);
    return () => clearTimeout(timer);
  }, [selectedArtist]);

  const setButtonRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(key, el);
    else buttonRefs.current.delete(key);
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDuration: '300ms' }}>
      {/* Our Stylists Header */}
      <div className="px-5 pt-5 pb-1">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-xl text-truffle italic">Our Stylists</h2>
          <button className="text-[11px] font-sans font-semibold text-bronze uppercase tracking-wider">
            View All
          </button>
        </div>

        {/* Artist Selector with sliding background */}
        <div className="relative" ref={artistRowRef}>
          {/* Sliding glass-orange pill behind active artist - connects to container below */}
          {tabStyle && (
            <div
              className="absolute glass-orange pointer-events-none"
              style={{
                left: tabStyle.left - 8,
                width: tabStyle.width + 16,
                top: -4,
                bottom: -16, // extends below to overlap with the content container
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderBottom: 'none',
                transition: 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: isJiggling ? 'jelly 0.55s ease' : 'none',
                transformOrigin: 'bottom center',
                zIndex: 0,
              }}
            />
          )}

          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3 items-end justify-center relative z-10">
            <button
              ref={setButtonRef('_all')}
              onClick={() => onSelectArtist(null)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div
                className={`rounded-full bg-champagne flex items-center justify-center text-[11px] font-sans font-semibold text-truffle border-2 transition-all duration-300 ease-out ${
                  !selectedArtist ? 'w-[68px] h-[68px] border-bronze shadow-lg' : 'w-14 h-14 border-transparent opacity-60'
                }`}
                style={!selectedArtist && isJiggling ? { animation: 'jelly 0.55s ease', transformOrigin: 'bottom center' } : undefined}
              >
                ALL
              </div>
              <span className={`text-[10px] font-sans font-medium uppercase tracking-wider transition-colors duration-200 ${
                !selectedArtist ? 'text-truffle' : 'text-bronze/50'
              }`}>
                All Artists
              </span>
            </button>

            {artists.map((artist) => {
              const isSelected = selectedArtist === artist.id;
              return (
                <button
                  key={artist.id}
                  ref={setButtonRef(artist.id)}
                  onClick={() => onSelectArtist(isSelected ? null : artist.id)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                >
                  <div
                    className={`rounded-full overflow-hidden border-2 transition-all duration-300 ease-out ${
                      isSelected
                        ? 'w-[68px] h-[68px] border-bronze shadow-lg'
                        : 'w-14 h-14 border-transparent opacity-60'
                    }`}
                    style={isSelected && isJiggling ? { animation: 'jelly 0.55s ease', transformOrigin: 'bottom center' } : undefined}
                  >
                    <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-[10px] font-sans font-medium uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ${
                    isSelected ? 'text-truffle' : 'text-bronze/50'
                  }`}>
                    {artist.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Container in glass - visually connected to the sliding tab above */}
      <div
        ref={containerRef}
        className="mx-3 glass-orange p-1"
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          animation: isJiggling ? 'jelly-container 0.5s ease' : 'none',
          transformOrigin: 'top center',
        }}
      >
        {/* Artist Reviews Header */}
        <div className="flex items-baseline justify-between px-4 pt-4 pb-3">
          <h3 className="font-serif text-lg text-truffle">
            {currentArtist ? (
              <>
                <span>{currentArtist.name.split('.')[0]}.</span>{' '}
                <span className="text-bronze italic">Reviews</span>
              </>
            ) : (
              <>
                All <span className="text-bronze italic">Reviews</span>
              </>
            )}
          </h3>
          <div className="flex items-center gap-1.5 bg-card rounded-full px-2.5 py-1">
            <Star size={12} className="text-bronze fill-bronze" />
            <span className="text-sm font-sans font-semibold text-truffle">{avgRating}</span>
          </div>
        </div>

        {/* Review Cards */}
        <div className="space-y-3 px-3 pb-4">
          {filteredReviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-card rounded-[32px] p-5 border border-border"
              style={{
                animation: `fade-in-up 0.4s ease-out ${index * 80}ms both`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-champagne flex items-center justify-center flex-shrink-0 border border-border">
                    <span className="font-serif text-base font-semibold text-truffle">
                      {review.userName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans font-semibold text-sm text-truffle">{review.userName}</span>
                      <CheckCircle2 size={14} className="text-bronze fill-bronze/20" />
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < review.rating ? 'text-bronze fill-bronze' : 'text-border'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-sans text-bronze/70 uppercase tracking-wider whitespace-nowrap">
                  {review.date}
                </span>
              </div>

              <div className="mb-2.5">
                <span className="inline-block text-[10px] font-sans font-semibold text-truffle uppercase tracking-wider bg-champagne border border-border px-3 py-1 rounded-full">
                  {review.service}
                </span>
              </div>

              <p className="text-[13px] font-sans text-truffle/80 leading-relaxed italic">
                "{review.text}"
              </p>

              {review.hasPhoto && (
                <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                  {reviewPhotos.map((photo, i) => (
                    <div key={i} className="w-40 h-40 flex-shrink-0 rounded-3xl overflow-hidden">
                      <img src={photo} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <p className="font-serif text-base text-bronze/60 italic">
                No reviews yet for this stylist...
              </p>
              <p className="text-[11px] font-sans text-bronze/40 mt-2">
                Be the first to share your experience
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
