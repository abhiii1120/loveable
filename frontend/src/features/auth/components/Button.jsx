function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Button({
  children,
  isLoading = false,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const base =
    "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-medium " +
    "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary:
      "bg-background-secondary text-text-inverted shadow-sm hover:bg-background-secondary/75 hover:shadow-md",
    accent:
      "bg-accent text-white shadow-sm hover:bg-accent/90 hover:shadow-md",
    secondary:
      "border border-line bg-surface text-ink hover:bg-line/30",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}