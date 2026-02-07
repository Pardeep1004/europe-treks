// src/components/Reviews.tsx
'use client';

import { useState, useEffect } from 'react';
import { Review, fetchReviews, addReview, uploadTrekPhoto } from '../lib/firebase';

interface Props {
    trekId: string;
}

export function Reviews({ trekId }: Props) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userName, setUserName] = useState('');
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        loadReviews();
    }, [trekId]);

    const loadReviews = async () => {
        const data = await fetchReviews(trekId);
        setReviews(data.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName || !comment) return;
        setSubmitting(true);

        try {
            let photoUrl = '';
            if (selectedFile) {
                photoUrl = await uploadTrekPhoto(trekId, selectedFile);
            }

            await addReview({
                trekId,
                userName,
                rating,
                comment,
                photoUrl,
                createdAt: new Date()
            });

            setUserName('');
            setComment('');
            setSelectedFile(null);
            loadReviews();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="reviews-section" style={{ marginTop: '5rem', paddingBottom: '5rem' }}>
            <div className="glass-card" style={{ padding: '3rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>🏔️</span> Trail Experiences
                </h2>

                <form onSubmit={handleSubmit} style={{ marginBottom: '4rem', display: 'grid', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <label className="filters label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-muted)' }}>
                            Full Name
                            <input
                                type="text"
                                style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '1rem', color: '#fff', outline: 'none', marginTop: '0.5rem' }}
                                value={userName}
                                onChange={e => setUserName(e.target.value)}
                                placeholder="e.g. Alex Harrison"
                            />
                        </label>
                        <label className="filters label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-muted)' }}>
                            Trail Rating
                            <select
                                value={rating}
                                onChange={e => setRating(Number(e.target.value))}
                                style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '1rem', color: '#fff', outline: 'none', marginTop: '0.5rem' }}
                            >
                                <option value="5">⭐⭐⭐⭐⭐ Phenomenal</option>
                                <option value="4">⭐⭐⭐⭐ Great Hike</option>
                                <option value="3">⭐⭐⭐ Steady</option>
                                <option value="2">⭐⭐ Challenging</option>
                                <option value="1">⭐ Poor Conditions</option>
                            </select>
                        </label>
                    </div>

                    <label className="filters label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Review Details
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Tell others about the hidden viewpoints or where to click the best pictures..."
                            style={{
                                background: 'var(--bg-dark)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '1rem',
                                padding: '1.2rem',
                                color: 'white',
                                minHeight: '120px',
                                outline: 'none',
                                lineHeight: '1.6',
                                marginTop: '0.5rem'
                            }}
                        />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', background: 'rgba(2, 6, 23, 0.4)', padding: '2rem', borderRadius: '1.25rem', border: '1px dashed var(--glass-border)' }}>
                        <label className="filters label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: 0, cursor: 'pointer' }}>
                            <span style={{ fontSize: '2.5rem' }}>📸</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Share a Trail View Point Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
                            />
                            {selectedFile && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>✓ {selectedFile.name} selected</span>}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="view-details"
                        style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}
                    >
                        {submitting ? '🏔️ Sharing Journey...' : 'Submit Trail Log'}
                    </button>
                </form>

                <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No logs yet. Be the first to document this trail!</p>
                        </div>
                    ) : (
                        reviews.map((r, i) => (
                            <div key={r.id || i} className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{r.userName}</span>
                                    <span style={{ color: '#fbbf24', fontSize: '1rem' }}>{'★'.repeat(r.rating)}</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.8' }}>"{r.comment}"</p>
                                {r.photoUrl && (
                                    <div style={{ borderRadius: '1.5rem', overflow: 'hidden', width: '100%', maxHeight: '500px', marginTop: '0.5rem' }}>
                                        <img
                                            src={r.photoUrl}
                                            alt="User photo"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                        />
                                    </div>
                                )}
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                    Shared on {new Date(r.createdAt.seconds * 1000).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
