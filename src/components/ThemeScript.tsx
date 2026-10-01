const CODE = `(function(){try{var s=localStorage.getItem('db-theme')||'system';var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||(s==='system'&&m);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: CODE }} suppressHydrationWarning />;
}
