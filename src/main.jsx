/* Entry: re-mounts the app when the language changes */
function Root() {
  const [k, setK] = useState(0);
  useEffect(() => { const f = () => setK((x) => x + 1); addEventListener('ah-lang', f); return () => removeEventListener('ah-lang', f); }, []);
  return <ToastHost key={k}><Router><App /></Router></ToastHost>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
