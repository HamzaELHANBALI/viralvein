interface ScoreBadgeProps {
    score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
    // Color coding based on score
    let gradientClass = '';
    let bgClass = '';

    if (score >= 5) {
        // Exceptional: Green
        gradientClass = 'from-green-400 to-emerald-500';
        bgClass = 'bg-green-500/20';
    } else if (score >= 2) {
        // Strong: Orange
        gradientClass = 'from-orange-400 to-amber-500';
        bgClass = 'bg-orange-500/20';
    } else {
        // Good: Yellow
        gradientClass = 'from-yellow-400 to-yellow-500';
        bgClass = 'bg-yellow-500/20';
    }

    return (
        <div className={`${bgClass} backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className={`text-sm font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                {score.toFixed(1)}x
            </span>
        </div>
    );
}
