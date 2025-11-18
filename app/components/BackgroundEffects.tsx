export default function BackgroundEffects() {
  return (
    <>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-black" />
      
      {/* Glow blobs */}
      <div 
        className="absolute -top-24 -left-24 h-72 w-72 md:h-96 md:w-96 rounded-full blur-3xl opacity-30"
        style={{background: 'radial-gradient(circle at 30% 30%,rgba(0, 255, 47, 0.45), transparent 60%)'}}
      />
      <div 
        className="absolute -bottom-24 -right-24 h-72 w-72 md:h-96 md:w-96 rounded-full blur-3xl opacity-30"
        style={{background: 'radial-gradient(circle at 70% 70%,rgba(255, 0, 0, 0.43), transparent 60%)'}}
      />
      
      {/* Gradient overlays for depth */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 md:h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-black/60 to-transparent" />
    </>
  );
}

