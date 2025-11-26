interface ScoreBadgeProps {
    score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
    // Color coding based on score
    let gradientClass = '';
    let bgClass = '';
    let label = '';

    if (score >= 5) {
        // Exceptional: Green
        gradientClass = 'from-green-400 to-emerald-500';
        bgClass = 'bg-green-500/20 border-green-500/30';
        label = 'Exceptional';
    } else if (score >= 2) {
        // Strong: Orange
        gradientClass = 'from-orange-400 to-amber-500';
        bgClass = 'bg-orange-500/20 border-orange-500/30';
        label = 'Strong';
    } else {
        // Good: Yellow
        gradientClass = 'from-yellow-400 to-yellow-500';
        bgClass = 'bg-yellow-500/20 border-yellow-500/30';
        label = 'Good';
    }

    return (
        <div
            className={`${bgClass} backdrop-blur-sm px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-lg`}
            title={`${label} viral score: ${score.toFixed(1)}x views-to-followers ratio`}
        >
            <svg className={`w-4 h-4 bg-gradient-to-r ${gradientClass} bg-clip-text`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className={`text-sm font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                {score.toFixed(1)}x
            </span>
        </div>
    );
}
