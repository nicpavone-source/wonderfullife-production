export default function Card({ title, text, icon, children }: { title: string; text?: string; icon?: string; children?: React.ReactNode }) {
  return (
    <div className="h-full rounded-[1.75rem] bg-white p-7 text-left shadow-wl">
      {icon ? <div className="mb-3 text-4xl">{icon}</div> : null}
      <h3 className="mb-2 text-2xl font-bold">{title}</h3>
      {text ? <p className="leading-relaxed text-muted">{text}</p> : null}
      {children}
    </div>
  );
}
