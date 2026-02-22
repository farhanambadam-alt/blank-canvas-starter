import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, ThumbsUp } from 'lucide-react';
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
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

  const artistRowRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  const updatePillPosition = useCallback(() => {
    const key = selectedArtist ?? '_all';
    const btn = buttonRefs.current.get(key);
    const row = artistRowRef.current;
    if (!btn || !row) return;

    const rowRect = row.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setPillStyle({
      left: btnRect.left - rowRect.left + (btnRect.width / 2) - 45,
      width: 90,
    });
  }, [selectedArtist]);

  useEffect(() => {
    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [updatePillPosition]);

  useEffect(() => {
    setIsJiggling(true);
    const timer = setTimeout(() => setIsJiggling(false), 600);
    return () => clearTimeout(timer);
  }, [selectedArtist]);

  const setRef = (key: string) => (el: HTMLDivElement | null) => {
    if (el) buttonRefs.current.set(key, el);
    else buttonRefs.current.delete(key);
  };

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: '5', label: '5★' },
    { key: '4', label: '4★+' },
    { key: 'photos', label: 'With Photos' },
  ];

  return (
    <div className="animate-fade-in-up" style={{ animationDuration: '300ms' }}>
      {/* Stylists Header */}
      <div className="px-5 pt-5 pb-0">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl text-truffle italic">Our Stylists</h2>
          <button className="text-[11px] font-sans font-semibold text-bronze uppercase tracking-wider hover:text-truffle transition-colors">
            View All
          </button>
        </div>

        {/* Artist Avatars with Jelly Pill */}
        <div className="relative" ref={artistRowRef}>
          {/* Sliding Jelly Pill */}
          {pillStyle && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: pillStyle.left,
                width: pillStyle.width,
                top: -6,
                bottom: -18,
                backgroundColor: 'hsl(var(--champagne))',
                border: '1.5px solid hsl(var(--bronze) / 0.2)',
                borderBottom: 'none',
                boxShadow: '0 2px 12px -2px hsl(var(--bronze) / 0.15)',
                borderTopLeftRadius: 45,
                borderTopRightRadius: 45,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                transition: 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease',
                animation: isJiggling ? 'jelly 0.6s ease' : 'none',
                transformOrigin: 'bottom center',
                zIndex: 0,
              }}
            />
          )}

          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 items-end justify-center relative z-10">
            {/* All button */}
            <button
              onClick={() => onSelectArtist(null)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div ref={setRef('_all')}>
                <div
                  className={`rounded-full bg-champagne flex items-center justify-center text-[11px] font-sans font-bold text-truffle transition-all duration-300 ease-out ${
                    !selectedArtist
                      ? 'w-16 h-16 ring-2 ring-accent shadow-md scale-110'
                      : 'w-14 h-14 opacity-60 grayscale-[40%]'
                  }`}
                >
                  ALL
                </div>
              </div>
              <span className={`text-[10px] font-sans font-medium uppercase tracking-wider transition-colors duration-200 ${
                !selectedArtist ? 'text-truffle font-semibold' : 'text-muted-foreground'
              }`}>
                All
              </span>
            </button>

            {artists.map((artist) => {
              const isSelected = selectedArtist === artist.id;
              return (
                <button
                  key={artist.id}
                  onClick={() => onSelectArtist(isSelected ? null : artist.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div ref={setRef(artist.id)}>
                    <div
                      className={`rounded-full overflow-hidden transition-all duration-300 ease-out ${
                        isSelected
                          ? 'w-16 h-16 ring-2 ring-accent shadow-md scale-110'
                          : 'w-14 h-14 opacity-60 grayscale-[40%]'
                      }`}
                    >
                      <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <span className={`text-[10px] font-sans font-medium uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ${
                    isSelected ? 'text-truffle font-semibold' : 'text-muted-foreground'
                  }`}>
                    {artist.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Container — overlaps the pill bottom for seamless connection */}
      <div
        className="mx-3 p-1"
        style={{
          backgroundColor: 'hsl(var(--champagne))',
          border: '1.5px solid hsl(var(--bronze) / 0.2)',
          borderTop: 'none',
          boxShadow: '0 4px 16px -4px hsl(var(--bronze) / 0.12)',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          marginTop: -16,
          animation: isJiggling ? 'jelly-container 0.5s ease' : 'none',
          transformOrigin: 'top center',
        }}
      >
        {/* Header + Rating + Filters */}
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center justify-between mb-3">
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
            <div className="flex items-center gap-1.5 bg-card rounded-full px-3 py-1.5 shadow-sm border border-border">
              <Star size={13} className="text-accent fill-accent" />
              <span className="text-sm font-sans font-bold text-truffle">{avgRating}</span>
              <span className="text-[10px] text-muted-foreground">({filteredReviews.length})</span>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setReviewFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-sans font-semibold whitespace-nowrap transition-all duration-200 ${
                  reviewFilter === tab.key
                    ? 'bg-truffle text-champagne shadow-sm'
                    : 'bg-card text-muted-foreground border border-border hover:border-bronze/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Review Cards */}
        <div className="space-y-3 px-3 pb-4 pt-2">
          {filteredReviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-card rounded-[28px] p-5 border border-border shadow-sm"
              style={{
                animation: `fade-in-up 0.4s ease-out ${index * 80}ms both`,
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-border">
                    <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans font-semibold text-sm text-truffle">{review.userName}</span>
                      <CheckCircle2 size={13} className="text-accent fill-accent/20" />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < review.rating ? 'text-accent fill-accent' : 'text-border'}
                        />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service badge */}
              <div className="mb-2.5">
                <span className="inline-block text-[10px] font-sans font-semibold text-truffle uppercase tracking-wider bg-champagne border border-border px-3 py-1 rounded-full">
                  {review.service}
                </span>
              </div>

              {/* Review text */}
              <p className="text-[13px] font-sans text-truffle/80 leading-relaxed">
                "{review.text}"
              </p>

              {/* Review photos */}
              {review.hasPhoto && (
                <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                  {reviewPhotos.map((photo, i) => (
                    <div key={i} className="w-36 h-36 flex-shrink-0 rounded-2xl overflow-hidden">
                      <img src={photo} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful button */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <button className="flex items-center gap-1.5 text-[11px] font-sans text-muted-foreground hover:text-truffle transition-colors">
                  <ThumbsUp size={12} />
                  <span>Helpful ({review.helpful})</span>
                </button>
                <span className="text-[10px] font-sans text-muted-foreground">
                  {review.artistId && artists.find(a => a.id === review.artistId)?.name}
                </span>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredReviews.length === 0 && (
            <div className="flex flex-col items-center py-14">
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4 shadow-sm">
                <Star size={24} className="text-muted-foreground" />
              </div>
              <p className="font-serif text-base text-muted-foreground italic text-center">
                Be the first to review{currentArtist ? ` ${currentArtist.name}` : ''}!
              </p>
              <p className="text-[11px] font-sans text-muted-foreground/60 mt-1.5 text-center">
                Share your experience and help others
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
